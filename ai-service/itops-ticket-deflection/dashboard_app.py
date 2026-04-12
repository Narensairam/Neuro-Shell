"""
Shell AI EOS–style enterprise AIOps demo dashboard (light theme, RFP-ready).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import streamlit as st

from src.agent import TicketAgent
from src.ot_security.ot_anomaly_detector import detect_ot_anomalies
from src.ot_security.ot_compliance_mapper import add_compliance
from src.ot_security.ot_data_simulator import OTSimConfig, simulate_ot_telemetry
from src.ot_security.ot_threat_classifier import add_threat_labels
from src.predictive_aiops.failure_risk import calculate_failure_probability
from src.predictive_aiops.multi_metric_trend import predict_multi_metric
from src.predictive_monitoring.data_generator import GeneratorConfig, generate_infra_metrics
from src.predictive_monitoring.infra_kb import load_infra_kb
from src.predictive_monitoring.pipeline import PredictiveMonitoringPipeline
from src.predictive_monitoring.ticket_integration import run_closed_loop
from src.predictive_monitoring.trend_predictor import TrendConfig, predict_trend_risks
from src.shadow_it.shadow_data_simulator import ShadowSimConfig, generate_shadow_data

# --- Shell-inspired enterprise light theme (not official brand assets) ---
EOS_CSS = """
<style>
    :root {
        --shell-yellow: #f5d400;
        --shell-red: #dd1d21;
        --ink: #1a1a1a;
        --muted: #5c6370;
        --card: #ffffff;
        --page: #f0f2f5;
        --line: #e6e8eb;
        --blue: #003d82;
    }
    .stApp { background: var(--page) !important; color: var(--ink) !important; }
    [data-testid="stHeader"] { background: var(--page) !important; }
    .eos-hero {
        background: linear-gradient(135deg, #ffffff 0%, #fffef5 50%, #fff8e6 100%);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 24px rgba(0,61,130,0.08);
    }
    .eos-title { font-size: 1.65rem; font-weight: 700; color: var(--blue); margin: 0; }
    .eos-sub { color: var(--muted); font-size: 0.95rem; margin-top: 0.35rem; }
    .eos-card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 1rem 1.1rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        margin-bottom: 0.75rem;
    }
    .eos-badge {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
    }
    .bg-ok { background: #e8f5e9; color: #1b5e20; }
    .bg-warn { background: #fff8e1; color: #f57f17; }
    .bg-crit { background: #ffebee; color: #b71c1c; }
    .ai-box {
        border-left: 4px solid var(--shell-yellow);
        background: #fffdf7;
        padding: 0.85rem 1rem;
        border-radius: 0 10px 10px 0;
        margin: 0.75rem 0;
    }
</style>
"""


def _health_status_row(r: pd.Series) -> tuple[str, str]:
    cpu, mem, lat, err = float(r["cpu_usage"]), float(r["memory_usage"]), float(r["network_latency"]), float(r["error_count"])
    if cpu >= 90 or mem >= 90 or lat >= 300 or err >= 20:
        return "Critical", "🚨"
    if cpu >= 75 or mem >= 78 or lat >= 180 or err >= 8:
        return "Warning", "⚠️"
    return "Healthy", "✅"


def _build_global_tickets(
    infra_alerts: list,
    ticket_agent: TicketAgent,
    ot_threats: pd.DataFrame,
    shadow_findings: pd.DataFrame,
) -> list[dict[str, Any]]:
    tickets: list[dict[str, Any]] = []
    tid = 204800

    for a in infra_alerts:
        routed = run_closed_loop(a, ticket_agent)
        if routed.get("ticket") is None:
            tickets.append(
                {
                    "ticket_id": f"EOS-{tid}",
                    "module": "Predictive Maintenance",
                    "linked_to": a.server_id,
                    "severity": a.severity,
                    "status": "No ticket (Info / normal)",
                    "title": f"Observation — {a.server_id}",
                    "resolution": "",
                    "detail": json.dumps({"message": a.message, "anomaly": a.anomaly}, default=str),
                }
            )
            tid += 1
            continue
        res = routed["ticket_agent_result"]
        tickets.append(
            {
                "ticket_id": f"EOS-{tid}",
                "module": "Predictive Maintenance",
                "linked_to": a.server_id,
                "severity": a.severity,
                "status": res["status"],
                "title": routed["ticket"]["title"],
                "resolution": res.get("solution", ""),
                "detail": json.dumps({"confidence": res.get("confidence"), "agent": res}, default=str),
            }
        )
        tid += 1

    if not ot_threats.empty:
        top_ot = ot_threats.sort_values(["severity", "timestamp"], ascending=[False, False]).head(12)
        for _, row in top_ot.iterrows():
            sev = str(row["severity"])
            status = "Escalated" if sev == "Critical" else "Deflected"
            tickets.append(
                {
                    "ticket_id": f"EOS-{tid}",
                    "module": "OT Security (IEC 62443)",
                    "linked_to": row["device_id"],
                    "severity": sev,
                    "status": status,
                    "title": f"{row['threat_type']} — {row['device_id']}",
                    "resolution": "Isolate segment; validate firmware and access controls per SOC playbook.",
                    "detail": json.dumps(
                        {
                            "threat": row["threat_type"],
                            "iec": row.get("iec_62443_category", ""),
                            "why": row.to_dict(),
                        },
                        default=str,
                    ),
                }
            )
            tid += 1

    if not shadow_findings.empty:
        sf = shadow_findings[shadow_findings["risk_score"] >= 40].sort_values("risk_score", ascending=False).head(15)
        for _, row in sf.iterrows():
            tickets.append(
                {
                    "ticket_id": f"EOS-{tid}",
                    "module": "Shadow IT",
                    "linked_to": row["device_id"],
                    "severity": "High" if row["risk_score"] >= 70 else "Medium",
                    "status": "Deflected",
                    "title": f"Unmanaged asset — {row['device_id']}",
                    "resolution": "Onboard to CMDB or quarantine until ownership verified.",
                    "detail": json.dumps(row.to_dict(), default=str),
                }
            )
            tid += 1

    return tickets


def render_app() -> None:
    st.set_page_config(page_title="Shell AI EOS — AIOps", layout="wide", initial_sidebar_state="expanded")
    st.markdown(EOS_CSS, unsafe_allow_html=True)

    with st.sidebar:
        st.markdown("### ⚙️ Demo controls")
        seed = st.number_input("Simulation seed", min_value=1, max_value=99999, value=42, step=1)
        if st.button("🔄 Regenerate simulation"):
            st.cache_data.clear()
            st.session_state["_seed"] = int(seed)
            st.rerun()
        st.caption("Flow: adjust seed → Regenerate → loading → refreshed risk story.")

    st.markdown(
        """
        <div class="eos-hero">
            <p class="eos-title">📊 Shell AI EOS — Enterprise AIOps Command Center</p>
            <p class="eos-sub">Unified observability, predictive risk, OT security, Shadow IT, and AI-driven ticket resolution.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Problem statement**")
        st.markdown(
            """
            - **50,000+** application support tickets/month globally; **~45%** repeat issues  
            - Hybrid estate: **on-prem**, **edge**, **multi-cloud**  
            - **OT** exposure (upstream / downstream / shipping) under advanced threats  
            - **M&A** legacy → unmanaged assets and shadow IT  
            """
        )
    with c2:
        st.markdown("**Expected outcomes (demo mapping)**")
        st.markdown(
            """
            - **65%** L1 deflection via AI self-service  
            - **35%** outage reduction via predictive monitoring  
            - **IEC 62443**-aligned OT threat coverage  
            - **Shadow IT** discovery across acquired entities  
            """
        )

    with st.spinner("⏳ Loading telemetry, threat models, and ticket correlation…"):
        @st.cache_data(show_spinner=False)
        def _infra(seed_: int) -> pd.DataFrame:
            return generate_infra_metrics(
                GeneratorConfig(
                    seed=seed_,
                    servers=12,
                    points_per_server=24 * 60,
                    anomaly_ratio=0.17,
                    degradation_ratio=0.20,
                )
            )

        @st.cache_data(show_spinner=False)
        def _ot(seed_: int) -> pd.DataFrame:
            df = simulate_ot_telemetry(OTSimConfig(seed=seed_, devices=80, points_per_device=60, anomaly_ratio=0.16))
            df = detect_ot_anomalies(df)
            df = add_threat_labels(df)
            return add_compliance(df)

        @st.cache_data(show_spinner=False)
        def _shadow(seed_: int) -> pd.DataFrame:
            return generate_shadow_data(ShadowSimConfig(seed=seed_, devices=250, shadow_ratio=0.18))

        use_seed = int(st.session_state.get("_seed", seed))
        infra_df = _infra(use_seed)
        infra_df["timestamp"] = pd.to_datetime(infra_df["timestamp"], utc=True, errors="coerce")
        ot_df = _ot(use_seed)
        shadow_raw = _shadow(use_seed)

        kb_texts, resolutions = load_infra_kb()
        ticket_agent = TicketAgent(threshold=0.35)
        ticket_agent.train(kb_texts, resolutions)

        pipeline = PredictiveMonitoringPipeline()
        pipeline.fit(infra_df)
        infra_alerts = pipeline.score_latest(infra_df, per_server=1)

        ot_threats = ot_df[(ot_df["anomaly"]) & (ot_df["threat_type"] != "Normal")].copy()
        shadow_alert = shadow_raw.copy()
        shadow_alert["status_label"] = shadow_alert.apply(
            lambda r: "🔴 High risk" if r["risk_score"] >= 70 else ("⚠️ Medium" if r["risk_score"] >= 40 else "✅ Low"),
            axis=1,
        )

        tickets = _build_global_tickets(infra_alerts, ticket_agent, ot_threats, shadow_alert)
        ticket_df = pd.DataFrame(tickets)

        latest_servers = infra_df.sort_values("timestamp").groupby("server_id", as_index=False).tail(1)
        _exp = latest_servers.apply(lambda r: _health_status_row(r), axis=1, result_type="expand")
        latest_servers["status"] = _exp[0]
        latest_servers["emoji"] = _exp[1]

        crit_n = int((latest_servers["status"] == "Critical").sum())
        warn_n = int((latest_servers["status"] == "Warning").sum())
        ok_n = int((latest_servers["status"] == "Healthy").sum())

    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("✅ Healthy servers", ok_n)
    m2.metric("⚠️ Warning", warn_n)
    m3.metric("🚨 Critical", crit_n)
    m4.metric("🔐 OT threats", len(ot_threats))
    m5.metric("🕵️ Shadow findings", int((shadow_alert["known"] == 0).sum()))

    tabs = st.tabs(
        [
            "📡 Live monitoring",
            "📈 Predictive risk",
            "🔐 OT SOC",
            "🕵️ Shadow IT",
            "🎫 Tickets & search",
            "🧠 AI insights",
        ]
    )

    with tabs[0]:
        st.subheader("Fleet status (latest sample per server)")
        show = latest_servers[
            ["server_id", "emoji", "status", "cpu_usage", "memory_usage", "network_latency", "error_count"]
        ].copy()
        show.columns = ["Server", " ", "Status", "CPU %", "Mem %", "Latency ms", "Errors"]
        st.dataframe(show, use_container_width=True, height=420)

        st.markdown('<div class="ai-box"><b>📊 AI insight:</b> Most fleet is stable; elevated rows correlate with '
                      'repeat-issue patterns and capacity pressure — prioritize scaling on 🚨 rows.</div>',
                      unsafe_allow_html=True)

        melt = infra_df.melt(
            id_vars=["timestamp", "server_id"],
            value_vars=["cpu_usage", "memory_usage", "network_latency", "error_count"],
            var_name="metric",
            value_name="value",
        )
        fig = px.line(
            melt,
            x="timestamp",
            y="value",
            color="server_id",
            facet_row="metric",
            height=720,
            template="plotly_white",
        )
        fig.update_layout(font=dict(color="#1a1a1a"))
        st.plotly_chart(fig, use_container_width=True)

    with tabs[1]:
        st.subheader("Predictive monitoring — current vs forecast")
        focus = st.selectbox("Drill-down server", sorted(infra_df["server_id"].unique()), key="pred_srv")
        srv_hist = infra_df[infra_df["server_id"] == focus].tail(90)
        mm = pd.DataFrame(
            {
                "cpu": srv_hist["cpu_usage"].astype(float).values,
                "memory": srv_hist["memory_usage"].astype(float).values,
                "errors": srv_hist["error_count"].astype(float).values,
            }
        )
        future_steps = 10
        pred = predict_multi_metric(mm, future_steps=future_steps)
        risk_pct = calculate_failure_probability(pred)

        c_a, c_b = st.columns([2, 1])
        with c_a:
            idx_h = np.arange(len(mm))
            idx_f = np.arange(len(mm), len(mm) + future_steps)
            figp = go.Figure()
            figp.add_trace(go.Scatter(x=idx_h, y=mm["cpu"], name="CPU actual", line=dict(color="#003d82")))
            figp.add_trace(go.Scatter(x=idx_f, y=pred["cpu"], name="CPU forecast", line=dict(dash="dash", color="#003d82")))
            figp.add_trace(go.Scatter(x=idx_h, y=mm["memory"], name="Memory actual", line=dict(color="#dd1d21")))
            figp.add_trace(go.Scatter(x=idx_f, y=pred["memory"], name="Memory forecast", line=dict(dash="dash", color="#dd1d21")))
            figp.update_layout(template="plotly_white", height=420, title=f"CPU / Memory — {focus}")
            st.plotly_chart(figp, use_container_width=True)
        with c_b:
            if risk_pct >= 55:
                st.error(f"🚨 Predicted incident risk elevated — failure probability **{risk_pct}%**")
                st.progress(min(risk_pct / 100.0, 1.0))
                st.warning("Likely threshold breach within forecast window — pre-scale recommended.")
            else:
                st.success(f"✅ Forecast risk **{risk_pct}%** — within tolerance for this server.")
                st.progress(min(risk_pct / 100.0, 1.0))

        trend_alerts = predict_trend_risks(infra_df, TrendConfig(history_points=30, future_steps=10))
        risky = [t for t in trend_alerts if t.server_id == focus]
        if risky:
            t0 = min(risky, key=lambda x: x.steps_to_breach)
            st.info(
                f"📌 **Predicted incident:** `{t0.metric}` on **{t0.server_id}** may breach threshold in ~**{t0.steps_to_breach}** minutes "
                f"(peak **{t0.predicted_peak:.1f}** vs threshold **{t0.threshold:.1f}**)."
            )

        st.markdown(
            '<div class="ai-box"><b>📊 AI insight:</b> Regression-based trend + multi-metric peak scoring surfaces '
            "systems that will breach before alarms fire — align capacity and change windows proactively.</div>",
            unsafe_allow_html=True,
        )

    with tabs[2]:
        st.subheader("OT security operations (SOC view)")
        st.markdown(
            '<div class="eos-card"><b>Showcase coverage:</b> firmware tampering (CRITICAL), DoS / unauthorized access (HIGH) — '
            "aligned to IEC 62443 control mapping.</div>",
            unsafe_allow_html=True,
        )
        if ot_threats.empty:
            st.warning("No classified threats — regenerate seed.")
        else:
            show_ot = ot_threats[
                [
                    "device_id",
                    "threat_type",
                    "severity",
                    "iec_62443_category",
                    "packet_rate",
                    "unauthorized_access_attempts",
                    "firmware_change_flag",
                ]
            ].head(40)
            st.dataframe(show_ot, use_container_width=True, height=360)

            c1, c2 = st.columns(2)
            with c1:
                st.plotly_chart(
                    px.histogram(ot_threats, x="threat_type", color="severity", template="plotly_white", height=320),
                    use_container_width=True,
                )
            with c2:
                ex = ot_threats.sort_values("severity", ascending=False).iloc[0]
                st.markdown("**Why detected**")
                st.write(
                    f"- Device **{ex['device_id']}**: {ex['threat_type']} (severity **{ex['severity']}**)\n"
                    f"- IEC 62443: **{ex.get('iec_62443_category', '')}**"
                )
                st.markdown("**Recommended action**")
                st.write("Isolate affected controller segment, verify firmware integrity, enforce access policy.")

        st.markdown(
            '<div class="ai-box"><b>📊 AI insight:</b> Behavioral anomaly scoring + priority rules mimic SOC triage for OT — '
            "safe for demo without live plant traffic.</div>",
            unsafe_allow_html=True,
        )

    with tabs[3]:
        st.subheader("Shadow IT & unmanaged assets")
        unmanaged = shadow_alert[shadow_alert["known"] == 0].copy()
        st.markdown(
            f'<div class="eos-card">🚨 <b>Unmanaged devices detected:</b> **{len(unmanaged)}** assets not aligned to inventory policy.</div>',
            unsafe_allow_html=True,
        )
        disp = shadow_alert[
            ["device_id", "location", "known", "risk_score", "network_activity", "access_frequency", "status_label"]
        ].sort_values("risk_score", ascending=False).head(80)
        disp.columns = ["Device", "Location", "In inventory (1=yes)", "Risk score", "Net activity", "Access freq", "Status"]
        st.dataframe(disp, use_container_width=True, height=400)

        st.plotly_chart(
            px.scatter(
                shadow_alert[shadow_alert["known"] == 0],
                x="network_activity",
                y="risk_score",
                color="location",
                size="access_frequency",
                template="plotly_white",
                title="Unmanaged assets — activity vs risk",
            ),
            use_container_width=True,
        )

        st.markdown(
            '<div class="ai-box"><b>📊 AI insight:</b> Post-M&A environments accumulate unknown endpoints — '
            "risk score prioritizes quarantine vs onboarding.</div>",
            unsafe_allow_html=True,
        )

    with tabs[4]:
        st.subheader("Global ticket register")
        st.caption("All anomalies below generate EOS ticket IDs for audit and deflection tracking.")
        if ticket_df.empty:
            st.info("No tickets.")
        else:
            st.dataframe(
                ticket_df[["ticket_id", "module", "linked_to", "severity", "status", "title"]],
                use_container_width=True,
                height=380,
            )
            q = st.text_input("🔎 Search by Ticket ID (e.g. EOS-204801)", "")
            if q.strip():
                hit = ticket_df[ticket_df["ticket_id"].str.contains(q.strip(), case=False, na=False)]
                if hit.empty:
                    st.warning("No matching ticket.")
                else:
                    row = hit.iloc[0]
                    st.markdown("### Ticket detail panel")
                    st.json(
                        {
                            "ticket_id": row["ticket_id"],
                            "module": row["module"],
                            "linked_to": row["linked_to"],
                            "severity": row["severity"],
                            "status": row["status"],
                            "title": row["title"],
                            "resolution": row["resolution"],
                            "raw": row["detail"],
                        }
                    )

    with tabs[5]:
        st.subheader("Cross-domain AI narrative (executive)")
        st.markdown(
            f"""
            **Narrative (this run @ {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}):**

            - 📡 **Infrastructure:** {ok_n} healthy / {warn_n} warning / {crit_n} critical — capacity and error trends visible before hard outages.  
            - 📈 **Predictive:** Multi-metric forecast + failure probability highlights systems likely to breach within minutes.  
            - 🔐 **OT:** {len(ot_threats)} classified threat events — map to IEC 62443 for governance storytelling.  
            - 🕵️ **Shadow IT:** {int((shadow_alert['known']==0).sum())} unmanaged or unknown-profile assets — quantify M&A attack surface.  
            - 🎫 **Tickets:** {len(ticket_df)} traceable EOS IDs — deflection vs escalation tracked for L1 automation KPIs.  
            """
        )
        st.success("✅ Demo mode: data is **mostly healthy** with **mandatory** warning/critical slices for stakeholder impact.")

    st.caption("Demo simulation — not production telemetry. Shell AI EOS naming is illustrative for RFP presentation.")


if __name__ == "__main__":
    render_app()
