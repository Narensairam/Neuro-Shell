from __future__ import annotations
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, List, Optional
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Importing existing logic - assuming we run from root
import sys
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from src.itsm_engine import ITSMOrchestrator, load_persisted_tickets, persist_tickets, next_ticket_id, merge_tickets_on_disk
from src.ot_security.ot_data_simulator import simulate_ot_telemetry, OTSimConfig
from src.ot_security.ot_anomaly_detector import detect_ot_anomalies
from src.ot_security.ot_threat_classifier import add_threat_labels
from src.predictive_monitoring.data_generator import generate_infra_metrics, GeneratorConfig
from src.predictive_aiops.failure_risk import calculate_failure_probability
from src.predictive_aiops.multi_metric_trend import predict_multi_metric
from src.shadow_it.shadow_data_simulator import generate_shadow_data, ShadowSimConfig
from src.shadow_it.shadow_detector import detect_shadow_it

import requests
import threading

def sync_to_core(domain, data):
    def _do_sync():
        try:
            requests.post("http://localhost:5007/api/sync", json={"domain": domain, "data": data}, timeout=2)
        except Exception as e:
            print(f"Sync failed: {e}")
    threading.Thread(target=_do_sync, daemon=True).start()

app = FastAPI(title="Shell EOS | Industrial ITSM API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ITSMOrchestrator()
# Seed demo tickets if disk is empty
merge_tickets_on_disk(engine)

def auto_create_preventive_ticket(server_id: str, risk_score: int, metrics: dict):
    """
    Creates an automated ticket if risk is high and no recent ticket exists for this server.
    """
    tickets = load_persisted_tickets()
    
    # Deduplication: check if we created a preventive ticket for this server in the last 10 mins
    now = datetime.now()
    for t in tickets[:20]: # Only check recent ones for performance
        if t.get("configuration_item") == server_id and "PREVENTIVE" in (t.get("short_description") or ""):
            created_at = datetime.strptime(t["created_at"], "%Y-%m-%d %H:%M:%S")
            if (now - created_at).total_seconds() < 600: # 10 minute cooldown
                return None

    # Determine severity based on risk
    severity = "High" if risk_score >= 85 else ("Medium" if risk_score >= 70 else "Low")
    
    # Create payload
    payload = {
        "ticket_id": None, # Auto-generate
        "requested_by": "Shell AI EOS Monitoring",
        "requested_for": "Predictive Maintenance Hub",
        "location": "Global / Cloud Explorer",
        "category": "Infrastructure",
        "subcategory1": "Automated Prediction",
        "subcategory2": "Resource Exhaustion",
        "severity": severity,
        "impact": "2 - Medium",
        "urgency": "2 - Medium",
        "short_description": f"[PREVENTIVE] High failure risk detected on {server_id}",
        "description": (
            f"AI Forecast detected a {risk_score}% probability of failure for {server_id}.\n"
            f"Telemetry: CPU {metrics.get('cpu_usage', 0):.1f}%, Mem {metrics.get('memory_usage', 0):.1f}%, ERR {metrics.get('error_count', 0)}.\n"
            f"Automation: Proactive ticket generated for deflection/assignment."
        ),
        "configuration_item": server_id,
        "channel": "API/AIOps",
        "assignment_group": "IT-AIOPS-L3"
    }
    
    new_ticket = engine.create_ticket(payload)
    tickets.insert(0, new_ticket)
    persist_tickets(tickets)
    return new_ticket

def auto_create_ot_ticket(device_id: str, threat_type: str, severity: str):
    """
    Creates an automated ticket for OT threat detections.
    """
    tickets = load_persisted_tickets()
    now = datetime.now()
    # Deduplication: 15 min cooldown for same device + threat
    for t in tickets[:30]:
        if t.get("configuration_item") == device_id and threat_type in (t.get("short_description") or ""):
            created_at = datetime.strptime(t["created_at"], "%Y-%m-%d %H:%M:%S")
            if (now - created_at).total_seconds() < 900:
                return None

    payload = {
        "requested_by": "Shell EOS Cyber-Guard",
        "requested_for": "OT Security Operations (SOC)",
        "location": "Localized Industrial Site",
        "category": "OT / Industrial",
        "subcategory1": "Security Breach",
        "subcategory2": threat_type,
        "severity": severity,
        "impact": "1 - Enterprise" if severity == "Critical" else "2 - Division",
        "urgency": "1 - High",
        "short_description": f"[CYBER-OT] {threat_type} detected on {device_id}",
        "description": f"AI Security engine detected malicious patterns matching {threat_type} on asset {device_id}. Severity: {severity}. Compliance: IEC 62443.",
        "configuration_item": device_id,
        "channel": "SOC-Automation"
    }
    new_ticket = engine.create_ticket(payload)
    tickets.insert(0, new_ticket)
    persist_tickets(tickets)
    return new_ticket

class TicketPayload(BaseModel):
    ticket_id: Optional[str] = None
    # User Details
    emp_id: str = "EMP-00123"
    requested_by: str
    email: str = "j.dash@shell.com"
    dept: str = "Hydrocarbons Operations"
    requested_for: Optional[str] = None
    
    # Location Details
    location: str
    location_type: str = "On-Prem"
    floor: Optional[str] = ""
    cubicle: Optional[str] = ""
    shift_timings: str
    
    # Classification
    category: str
    subcategory1: str
    subcategory2: Optional[str] = ""
    subcategory3: Optional[str] = ""
    
    # Technical & Priority
    configuration_item: Optional[str] = ""
    impact: str
    urgency: str
    priority: str
    severity: str
    
    # Description
    short_description: str
    description: str
    
    # Meta
    channel: str = "Portal"
    assignment_group: str = "IT-OT-L3"

@app.get("/api/tickets")
async def get_tickets():
    return load_persisted_tickets()

@app.post("/api/tickets")
async def create_ticket(payload: TicketPayload):
    tickets = load_persisted_tickets()
    if not payload.ticket_id:
        payload.ticket_id = next_ticket_id([t["ticket_id"] for t in tickets])
    
    ticket = engine.create_ticket(payload.dict())
    tickets.insert(0, ticket)
    persist_tickets(tickets)
    
    # Sync to Core
    sync_to_core("itops", {
        "tickets": tickets[:20],
        "stats": { "total_tickets": len(tickets) }
    })
    return ticket

@app.get("/api/workers")
async def get_workers():
    return [asdict(w) for w in engine.workers]

@app.get("/api/metrics/summary")
async def get_summary_metrics():
    try:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Generating Infra Metrics...")
        infra_df = generate_infra_metrics(GeneratorConfig(points_per_server=15))
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulating OT Telemetry...")
        ot_telemetry = simulate_ot_telemetry(OTSimConfig(devices=40, anomaly_ratio=0.35))
        ot_results = detect_ot_anomalies(ot_telemetry)
        # Force showcase devices to be anomalous
        ot_results.loc[ot_results["device_id"].isin(["plc_001", "plc_002", "plc_003"]), "anomaly"] = True
        ot_results = add_threat_labels(ot_results)
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Scanning Shadow IT...")
        shadow_data = generate_shadow_data(ShadowSimConfig(devices=150))
        shadow_results = detect_shadow_it(shadow_data)
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Finalizing Summary...")
        tickets = load_persisted_tickets()
        deflected = [t for t in tickets if t.get("status") == "Deflected"]
        critical = [t for t in tickets if t.get("is_severe")]
        
        # Count unique devices under threat
        threatened_devices = ot_results[ot_results["anomaly"] & (ot_results["threat_type"] != "Normal")]["device_id"].nunique()
        
        res = {
            "total_tickets": len(tickets),
            "deflection_rate": round(len(deflected) / len(tickets) * 100, 1) if tickets else 0,
            "critical_alerts": len(critical),
            "ot_threats": max(int(threatened_devices), 4), 
            "shadow_devices": len(shadow_results),
            "avg_resolution_time_hrs": 4.2
        }
        
        # Sync metrics to core
        sync_to_core("itops_stats", res)
        
        return res
    except Exception as e:
        print(f"Error in summary metrics: {e}")
        return {
            "total_tickets": 0, "deflection_rate": 0, "critical_alerts": 0,
            "ot_threats": 0, "shadow_devices": 0, "avg_resolution_time_hrs": 0
        }

@app.get("/api/operational/ot")
async def get_ot_threats():
    try:
        # Dynamic seed based on time for "ups and downs"
        seed = int(datetime.now().timestamp()) % 1000
        # Reduced anomaly ratio for a more realistic distribution
        telemetry = simulate_ot_telemetry(OTSimConfig(devices=100, anomaly_ratio=0.20, seed=seed))
        results = detect_ot_anomalies(telemetry)
        # Ensure our showcase devices are always highlighted (reduced to 3 for less noise)
        results.loc[results["device_id"].isin(["plc_001", "plc_002", "plc_003"]), "anomaly"] = True
        results = add_threat_labels(results)
        
        threat_df = results[(results["anomaly"]) & (results["threat_type"] != "Normal")]
        
        # Deduplicate: keep only the latest threat record per device for a clean, professional dashboard
        threat_df = threat_df.sort_values("timestamp", ascending=False).drop_duplicates("device_id")
        
        # Auto-Ticket creation for the top threats in this cycle
        for _, row in threat_df.head(3).iterrows():
            if row["severity"] in ["High", "Critical"]:
                auto_create_ot_ticket(row["device_id"], row["threat_type"], row["severity"])
                
        return threat_df.to_dict(orient="records")
    except Exception as e:
        print(f"Error in OT threats endpoint: {e}")
        return []

@app.get("/api/operational/infra")
async def get_infra_health():
    try:
        # Dynamic seed for infra metrics
        seed = (int(datetime.now().timestamp()) // 10) % 1000
        df = generate_infra_metrics(GeneratorConfig(
            points_per_server=100, 
            anomaly_ratio=0.25, 
            degradation_ratio=0.35,
            seed=seed
        ))
        # Add failure risk for each server
        results = []
        for srv_id in df["server_id"].unique():
            srv_data = df[df["server_id"] == srv_id].tail(60)
            mm_df = srv_data[["cpu_usage", "memory_usage", "error_count"]].rename(columns={
                "cpu_usage": "cpu", "memory_usage": "memory", "error_count": "errors"
            })
            # Simple prediction + risk
            pred = predict_multi_metric(mm_df, future_steps=10)
            risk = calculate_failure_probability(pred)
            
            last_row = srv_data.iloc[-1]
            latest = last_row.to_dict()
            
            # Alignment with Frontend naming
            latest["latency_ms"] = float(last_row.get("network_latency", 0))
            latest["failure_risk"] = float(risk)
            
            # Calculate anomaly flag for Frontend (matches GeneratorConfig thresholds)
            is_anom = (
                latest["cpu_usage"] >= 90 or 
                latest["memory_usage"] >= 85 or 
                latest["latency_ms"] >= 300 or 
                latest["error_count"] >= 20
            )
            latest["anomaly"] = bool(is_anom)
            
            latest["history"] = srv_data.to_dict(orient="records")
            # Ensure history rows also have latency_ms for charts
            for h in latest["history"]:
                h["latency_ms"] = float(h.get("network_latency", 0))
                
            # [AIOPS CLOSED-LOOP]
            # Automatically create tickets for high risk (>70%) or Critical anomaly states
            if risk >= 70 or is_anom:
                auto_create_preventive_ticket(srv_id, risk, latest)

            results.append(latest)
        return results
    except Exception as e:
        print(f"Error in infra health endpoint: {e}")
        return []

@app.get("/api/operational/shadow")
async def get_shadow_it():
    try:
        # Use dynamic seed for refreshed detection results
        seed = int(datetime.now().timestamp()) % 1000
        shadow_df = generate_shadow_data(ShadowSimConfig(seed=seed))
        alerts = detect_shadow_it(shadow_df)
        
        # Map alerts by device_id for easy lookup
        alert_map = {row["device_id"]: (reason, severity) for row, reason, severity in alerts}
        
        results = []
        for _, row in shadow_df.iterrows():
            item = row.to_dict()
            if item["device_id"] in alert_map:
                reason, severity = alert_map[item["device_id"]]
                item["issue"] = reason
                item["severity"] = severity
            else:
                item["issue"] = None
                item["severity"] = "Low"
            results.append(item)
        return results
    except Exception as e:
        print(f"Error in shadow it endpoint: {e}")
        return []

@app.get("/health")
async def health_check():
    """Health check endpoint for platform monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Shell EOS API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("  Shell AI EOS | FastAPI Backend Starting")
    print("  API Server: http://127.0.0.1:5004")
    print("  API Docs: http://localhost:5004/docs")
    print("  Health Check: http://localhost:5004/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=5004)
