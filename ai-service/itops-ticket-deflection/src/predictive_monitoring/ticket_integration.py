from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional

from src.agent import TicketAgent
from src.predictive_monitoring.schemas import Alert


@dataclass(frozen=True)
class TicketPayload:
    title: str
    description: str
    category: str


def alert_to_ticket(alert: Alert) -> TicketPayload:
    category = "Infrastructure"
    if alert.component and "Network" in alert.component:
        category = "Network"
    if alert.component and "Service" in alert.component:
        category = "Software"
    if alert.component and "Storage" in alert.component:
        category = "Hardware"

    # Meaningful title (avoid vague phrases)
    title = f"{alert.severity} {alert.message} on {alert.server_id}"
    description = (
        f"Predictive monitoring alert.\n"
        f"- server: {alert.server_id}\n"
        f"- severity: {alert.severity}\n"
        f"- anomaly: {alert.anomaly} (score={alert.score:.3f})\n"
        f"- confidence: {alert.confidence:.2f}\n"
        f"- message: {alert.message}\n"
        f"- recommended action: {alert.action}\n"
    )
    if alert.root_cause:
        description += f"- root-cause hint: {alert.root_cause} ({alert.component})\n"

    return TicketPayload(title=title, description=description, category=category)


def run_closed_loop(alert: Alert, ticket_agent: TicketAgent) -> Dict:
    """
    Creates a ticket from an alert and routes it through the TicketAgent.
    This demonstrates the 'closed-loop AIOps' integration path.
    """
    if alert.severity == "Info":
        return {
            "ticket": None,
            "ticket_agent_result": None,
            "note": "Ticket creation skipped for Info severity.",
        }

    payload = alert_to_ticket(alert)
    routed = ticket_agent.handle_ticket(payload.title + " " + payload.description)

    return {
        "ticket": {
            "title": payload.title,
            "category": payload.category,
        },
        "ticket_agent_result": routed,
    }

