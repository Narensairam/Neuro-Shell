from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import pandas as pd


@dataclass(frozen=True)
class OTAlert:
    device_id: str
    threat_type: str
    severity: str
    iec_62443_category: str
    compliance_risk: str
    occurrence_count: int
    explanation: list[str]
    action: str


def _action_for(threat_type: str) -> str:
    actions = {
        "Unauthorized Access Attack": "Isolate device, block suspicious source, rotate credentials, and review access logs.",
        "Denial of Service (DoS)": "Apply rate limiting and network filtering; isolate segment if needed.",
        "Command Injection": "Disable remote execute, isolate device, validate command sources, and review PLC logic changes.",
        "Firmware Tampering": "Isolate device, rollback/verify firmware integrity, and audit change controls.",
    }
    return actions.get(threat_type, "Investigate and validate against baseline behavior.")


def _business_impact_for(threat_type: str) -> str:
    impacts = {
        "Firmware Tampering": "Risk of compromised device integrity and operational disruption.",
        "Unauthorized Access Attack": "Risk of unauthorized control of OT assets and potential data breach.",
        "Denial of Service (DoS)": "Potential service disruption and downtime impacting production.",
        "Command Injection": "Risk of unsafe or unintended actions executed on industrial equipment.",
    }
    return impacts.get(threat_type, "Potential impact to operational continuity and safety posture.")


def build_ot_alert(row: pd.Series) -> OTAlert:
    device = str(row["device_id"])
    threat = str(row["threat_type"])
    sev = str(row["severity"])
    iec = str(row["iec_62443_category"])
    risk = str(row["compliance_risk"])
    count = int(row.get("occurrence_count", 1))

    explanation_parts: list[str] = []
    if float(row["packet_rate"]) > 500:
        explanation_parts.append("High packet rate observed")
    if int(row["unauthorized_access_attempts"]) > 3:
        explanation_parts.append("Multiple unauthorized access attempts")
    if int(row["failed_commands"]) > 10:
        explanation_parts.append("High number of failed commands")
    if int(row["firmware_change_flag"]) == 1:
        explanation_parts.append("Unexpected firmware change detected")

    if not explanation_parts:
        explanation_parts.append("Behavioral anomaly detected versus baseline")

    action = _action_for(threat)
    # store as free-text; business impact is derived at render time

    return OTAlert(
        device_id=device,
        threat_type=threat,
        severity=sev,
        iec_62443_category=iec,
        compliance_risk=risk,
        occurrence_count=count,
        explanation=explanation_parts,
        action=action,
    )


def format_ot_alert(alert: OTAlert) -> str:
    lines = [
        "[OT ALERT]",
        f"Device: {alert.device_id}",
        f"Threat: {alert.threat_type}",
        f"Severity: {alert.severity}",
        f"IEC 62443: {alert.iec_62443_category}",
        f"Compliance Risk: {alert.compliance_risk}",
        f"Occurrences: {alert.occurrence_count}",
        "",
        "Why:",
    ]
    for reason in alert.explanation:
        lines.append(f"- {reason}")

    lines.append("")
    lines.append("Business Impact:")
    lines.append(f"- {_business_impact_for(alert.threat_type)}")
    lines.append("")
    lines.append("Recommended Action:")
    for step in alert.action.split(". "):
        step = step.strip().rstrip(".")
        if not step:
            continue
        lines.append(f"- {step}.")

    lines.append("")  # trailing newline
    return "\n".join(lines)

