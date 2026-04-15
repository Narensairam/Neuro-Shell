from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from src.agent import TicketAgent
from src.preprocess import clean_text

ROOT = Path(__file__).resolve().parents[1]
STORE_PATH = ROOT / "data" / "itsm_tickets.json"


@dataclass(frozen=True)
class WorkerProfile:
    name: str
    role: str
    specialty: str
    issue_type: str
    contact: str


# 20 workers — escalation agent assigns by issue category
WORKER_ROSTER: list[WorkerProfile] = [
    WorkerProfile("Aarav Menon", "L2 Network Engineer", "WAN/VPN recovery", "Network", "aarav.menon@plantops.ai"),
    WorkerProfile("Diya Patel", "Service Desk Analyst", "Access restoration", "Access", "diya.patel@plantops.ai"),
    WorkerProfile("Kabir Nair", "Windows Engineer", "Endpoint software failures", "Software", "kabir.nair@plantops.ai"),
    WorkerProfile("Ishita Rao", "Cloud Ops Engineer", "Cloud incidents", "Cloud", "ishita.rao@plantops.ai"),
    WorkerProfile("Vihaan Shah", "Security Analyst", "Identity and phishing", "Security", "vihaan.shah@plantops.ai"),
    WorkerProfile("Meera Iyer", "OT Support Engineer", "Plant-floor device issues", "OT Systems", "meera.iyer@plantops.ai"),
    WorkerProfile("Rohan Gupta", "Database Administrator", "Database performance", "Database", "rohan.gupta@plantops.ai"),
    WorkerProfile("Anika Bose", "Hardware Specialist", "Printers and endpoints", "Hardware", "anika.bose@plantops.ai"),
    WorkerProfile("Arjun Sethi", "Network Reliability Engineer", "Routing and latency", "Network", "arjun.sethi@plantops.ai"),
    WorkerProfile("Sana Khan", "Workplace Tech Lead", "Productivity suite issues", "Software", "sana.khan@plantops.ai"),
    WorkerProfile("Yash Malhotra", "IAM Engineer", "Password and MFA issues", "Access", "yash.malhotra@plantops.ai"),
    WorkerProfile("Nisha Verma", "SOC Responder", "Cybersecurity escalation", "Security", "nisha.verma@plantops.ai"),
    WorkerProfile("Rahul Das", "Edge Platform Engineer", "Factory edge services", "OT Systems", "rahul.das@plantops.ai"),
    WorkerProfile("Pooja Singh", "Storage Engineer", "Disk and storage alerts", "Hardware", "pooja.singh@plantops.ai"),
    WorkerProfile("Kiran Desai", "L3 Apps Engineer", "Business application incidents", "Software", "kiran.desai@plantops.ai"),
    WorkerProfile("Neha Kulkarni", "IAM Lead", "Enterprise access governance", "Access", "neha.kulkarni@plantops.ai"),
    WorkerProfile("Vikram Joshi", "Cloud Architect", "Multi-cloud incidents", "Cloud", "vikram.joshi@plantops.ai"),
    WorkerProfile("Tara Bhatt", "OT Cyber Analyst", "ICS/OT security events", "Security", "tara.bhatt@plantops.ai"),
    WorkerProfile("Advait Deshmukh", "SCADA Integration Specialist", "PLC/SCADA protocol bridge", "OT Systems", "advait.d@plantops.ai"),
    WorkerProfile("Zoya Ali", "Application Security Engineer", "Secure code and API threats", "Security", "zoya.ali@plantops.ai"),
]

ISSUE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "Network": ("vpn", "wifi", "latency", "network", "dns", "router", "switch", "packet", "wan"),
    "Software": ("outlook", "application", "app", "software", "service", "login page", "crash", "bug"),
    "Hardware": ("printer", "laptop", "device", "disk", "keyboard", "screen", "storage", "hardware"),
    "Access": ("password", "mfa", "access", "unlock", "login", "sso", "identity", "permission"),
    "Security": ("malware", "breach", "phishing", "ransomware", "unauthorized", "attack", "threat", "compromised"),
    "Database": ("database", "sql", "query", "db", "replication", "deadlock"),
    "Cloud": ("aws", "azure", "cloud", "kubernetes", "pod", "container", "vm"),
    "OT Systems": ("scada", "plc", "sensor", "plant", "factory", "line", "ics", "ot"),
}

SEVERE_SEVERITIES = {"critical", "high", "sev1", "sev2", "p1", "p2"}
SEVERE_HINTS = {
    "outage",
    "plant down",
    "production stopped",
    "safety",
    "cyberattack",
    "breach",
    "all users",
    "multiple sites",
    "unable to operate",
    "major incident",
    "ransomware",
    "nation-state",
    "data loss",
    "critical failure",
    "safety hazard",
}


def _load_resolution_data() -> tuple[pd.Series, list[str]]:
    tickets = pd.read_csv(ROOT / "data" / "tickets.csv")
    kb = pd.read_csv(ROOT / "data" / "knowledge_base.csv")

    ticket_texts = (tickets["title"].astype(str) + " " + tickets["description"].astype(str)).apply(clean_text)
    kb_texts = (kb["title"].astype(str) + " " + kb["summary"].astype(str)).apply(clean_text)
    texts = pd.concat([ticket_texts, kb_texts], ignore_index=True)
    resolutions = tickets["resolution"].astype(str).tolist() + kb["resolution"].astype(str).tolist()
    return texts, resolutions


def infer_issue_type(title: str, description: str) -> str:
    haystack = clean_text(f"{title} {description}")
    scores: dict[str, int] = {}
    for issue_type, keywords in ISSUE_KEYWORDS.items():
        scores[issue_type] = sum(1 for keyword in keywords if keyword in haystack)
    best_type = max(scores, key=scores.get)
    return best_type if scores[best_type] > 0 else "Software"


def compute_priority(impact: str, urgency: str) -> str:
    """ServiceNow-style priority from impact x urgency (1=High, 3=Low)."""
    imap = {"1 - High": 1, "2 - Medium": 2, "3 - Low": 3}
    umap = {"1 - High": 1, "2 - Medium": 2, "3 - Low": 3}
    i = imap.get(impact, 2)
    u = umap.get(urgency, 2)
    score = i * u
    if score <= 2:
        return "1 - Critical"
    if score <= 4:
        return "2 - High"
    if score <= 6:
        return "3 - Moderate"
    return "4 - Low"


def infer_is_severe(
    severity: str,
    description: str,
    impact: str | None = None,
    urgency: str | None = None,
) -> bool:
    """Route to Escalation Caller Agent when severity/description/impact demand human handling."""
    severity_key = clean_text(severity)
    description_key = clean_text(description)

    if severity_key in SEVERE_SEVERITIES or severity_key in {"high", "critical"}:
        return True
    if "medium" in severity_key and any(hint in description_key for hint in SEVERE_HINTS):
        return True
    if "medium" in severity_key and impact and str(impact).startswith("1 -"):
        return True
    if "medium" in severity_key and urgency and str(urgency).startswith("1 -"):
        return True
    if impact and impact.startswith("1 -"):
        if any(hint in description_key for hint in SEVERE_HINTS):
            return True
    if any(hint in description_key for hint in SEVERE_HINTS):
        return True
    return False


def build_assignment_notification(ticket_id: str, worker: WorkerProfile, title: str, issue_type: str) -> str:
    return (
        f"[NOTIFICATION] Escalation Caller Agent -> {worker.name} ({worker.role}) | {worker.contact}\n"
        f"New assignment: {ticket_id} | Category: {issue_type} | {title}\n"
        f"Please acknowledge and take ownership in the ITSM console."
    )


def load_persisted_tickets() -> list[dict[str, Any]]:
    if not STORE_PATH.exists():
        return []
    try:
        data = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def persist_tickets(tickets: list[dict[str, Any]]) -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STORE_PATH.write_text(json.dumps(tickets, indent=2, ensure_ascii=False), encoding="utf-8")


class ITSMOrchestrator:
    def __init__(self, threshold: float = 0.22):
        texts, resolutions = _load_resolution_data()
        self.agent = TicketAgent(threshold=threshold)
        self.agent.train(texts, resolutions)
        self.escalation_agent_name = "Escalation Caller Agent"
        self.workers = WORKER_ROSTER

    def assign_worker(self, issue_type: str, ticket_id: str) -> WorkerProfile:
        matches = [w for w in self.workers if w.issue_type == issue_type]
        pool = matches if matches else self.workers
        index = sum(ord(c) for c in ticket_id) % len(pool)
        return pool[index]

    def create_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        ticket_id = payload.get("ticket_id")
        if not ticket_id:
            # Auto-generate if missing (fixes null ID issues for automated tickets)
            existing = load_persisted_tickets()
            ticket_id = next_ticket_id([t.get("ticket_id") for t in existing if t.get("ticket_id")])
        
        title = (payload.get("short_description") or payload.get("title") or "").strip()
        description = (payload.get("description") or "").strip()
        severity = (payload.get("severity") or "Low").strip()
        impact = payload.get("impact") or "3 - Low"
        urgency = payload.get("urgency") or "3 - Low"
        priority = payload.get("priority") or compute_priority(str(impact), str(urgency))
        issue_type = payload.get("issue_type") or infer_issue_type(title, description)

        severe = infer_is_severe(severity, description, str(impact), str(urgency))

        base: dict[str, Any] = {
            "ticket_id": ticket_id,
            "created_at": timestamp,
            "requested_by": (payload.get("requested_by") or "").strip(),
            "requested_for": (payload.get("requested_for") or payload.get("requested_by") or "").strip(),
            "location": (payload.get("location") or "").strip(),
            "floor": (payload.get("floor") or "").strip(),
            "cubicle": (payload.get("cubicle") or "").strip(),
            "shift_timings": (payload.get("shift_timings") or "").strip(),
            "configuration_item": (payload.get("configuration_item") or "").strip(),
            "ou": (payload.get("ou") or "").strip(),
            "category": (payload.get("category") or "").strip(),
            "subcategory1": (payload.get("subcategory1") or "").strip(),
            "subcategory2": (payload.get("subcategory2") or "").strip(),
            "subcategory3": (payload.get("subcategory3") or "").strip(),
            "channel": (payload.get("channel") or "").strip(),
            "assignment_group": (payload.get("assignment_group") or "").strip(),
            "impact": impact,
            "urgency": urgency,
            "priority": priority,
            "severity": severity,
            "alert_flag": payload.get("alert_flag", "Yes"),
            "service_request_flag": payload.get("service_request_flag", "Yes"),
            "task_flag": payload.get("task_flag", "Yes"),
            "title": title,
            "short_description": title,
            "description": description,
            "issue_type": issue_type,
            "business_unit": (payload.get("business_unit") or "").strip(),
            "site": (payload.get("site") or payload.get("location") or "").strip(),
            "service": (payload.get("service") or "").strip(),
            "status": "Open",
            "incident_state": "New",
            "assigned_to": "",
            "assigned_role": "",
            "assignment_agent": "",
            "resolution": "",
            "matched_issue": "",
            "confidence": 0.0,
            "notification": "",
            "is_severe": severe,
        }

        if severe:
            worker = self.assign_worker(issue_type, ticket_id)
            base.update(
                {
                    "status": "Pooled",
                    "incident_state": "Awaiting Assignment",
                    "assigned_to": worker.name,
                    "assigned_role": worker.role,
                    "assignment_agent": self.escalation_agent_name,
                    "notification": build_assignment_notification(ticket_id, worker, title, issue_type),
                }
            )
            return base

        result = self.agent.handle_ticket(f"{title} {description}")
        solution = result.get("solution") or (
            "Validate against the knowledge base; if unresolved, reopen with more detail."
        )
        matched_issue = result.get("matched_issue", "")
        conf = round(float(result.get("confidence", 0.0)), 2)
        base.update(
            {
                "status": "Deflected",
                "incident_state": "Resolved",
                "resolution": solution,
                "matched_issue": str(matched_issue)[:500] if matched_issue else "",
                "confidence": conf,
                "notification": (
                    f"AI Self-Service resolved {ticket_id} using historical tickets + KB. "
                    f"Confidence {conf}."
                ),
            }
        )
        return base

    def seed_demo_tickets(self) -> list[dict[str, Any]]:
        demo_payloads = [
            {
                "ticket_id": "IM0002401",
                "requested_by": "Priya Sharma",
                "requested_for": "Priya Sharma",
                "location": "Sadara Chemical Complex[Site] - Plant",
                "floor": "Ground",
                "cubicle": "R-128",
                "shift_timings": "7am - 3pm",
                "ou": "Hydrocarbons Operations",
                "category": "Business and Office Applications",
                "subcategory1": "Business Applications",
                "subcategory2": "Innovate@",
                "subcategory3": "Access Issue",
                "channel": "Email",
                "assignment_group": "IT-CAS-HYPE-L3",
                "impact": "3 - Low",
                "urgency": "3 - Medium",
                "severity": "Low",
                "short_description": "VPN not connecting for remote planners",
                "description": "Two planners are unable to connect to VPN after password reset.",
                "issue_type": "Network",
            },
            {
                "ticket_id": "IM0002402",
                "requested_by": "Priya Sharma",
                "requested_for": "Priya Sharma",
                "location": "Sadara Chemical Complex[Site] - Plant",
                "floor": "Ground",
                "cubicle": "R-128",
                "shift_timings": "7am - 3pm",
                "ou": "Hydrocarbons Operations",
                "category": "OT / Industrial",
                "subcategory1": "SCADA",
                "subcategory2": "Gateway",
                "subcategory3": "Outage",
                "channel": "Phone",
                "assignment_group": "IT-OT-L3",
                "impact": "1 - High",
                "urgency": "1 - High",
                "severity": "High",
                "short_description": "SCADA gateway outage affecting line monitoring",
                "description": "Production stopped in one line; operators unable to operate the SCADA dashboard.",
                "issue_type": "OT Systems",
            },
        ]
        seeded: list[dict[str, Any]] = []
        for p in demo_payloads:
            p["priority"] = compute_priority(p["impact"], p["urgency"])
            seeded.append(self.create_ticket(p))
        return seeded

    def worker_table(self) -> pd.DataFrame:
        return pd.DataFrame([asdict(w) for w in self.workers])


def next_ticket_id(existing_ids: list[str]) -> str:
    """Next IM######## id (supports legacy INC-* ids in storage)."""
    best = 2400
    for tid in existing_ids:
        s = str(tid).upper()
        m = re.search(r"IM(\d+)", s) or re.search(r"INC[-]?(\d+)", s)
        if m:
            best = max(best, int(m.group(1)))
    return f"IM{best + 1:07d}"


def merge_tickets_on_disk(engine: ITSMOrchestrator) -> list[dict[str, Any]]:
    """Load disk + seed if empty."""
    existing = load_persisted_tickets()
    if existing:
        return existing
    seeded = engine.seed_demo_tickets()
    persist_tickets(seeded)
    return seeded
