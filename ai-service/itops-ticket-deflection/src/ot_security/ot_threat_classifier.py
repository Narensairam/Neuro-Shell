from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Tuple

import pandas as pd


ThreatType = Literal[
    "Unauthorized Access Attack",
    "Command Injection",
    "Denial of Service (DoS)",
    "Firmware Tampering",
    "Normal",
]

Severity = Literal["Low", "Medium", "High", "Critical"]


@dataclass(frozen=True)
class OTThreatRules:
    unauthorized_access_attempts: int = 3
    packet_rate_dos: float = 500.0
    failed_commands_high: int = 10


def classify_threat(row: pd.Series, rules: OTThreatRules = OTThreatRules()) -> Tuple[ThreatType, Severity]:
    if not bool(row.get("anomaly", False)):
        return ("Normal", "Low")

    unauthorized = int(row["unauthorized_access_attempts"])
    packet_rate = float(row["packet_rate"])
    failed = int(row["failed_commands"])
    firmware = int(row["firmware_change_flag"])
    cmd = str(row["command_type"])

    # Priority order (mutually exclusive)
    # 1) Firmware Tampering
    if firmware == 1:
        threat: ThreatType = "Firmware Tampering"
    # 2) Unauthorized Access
    elif unauthorized > rules.unauthorized_access_attempts:
        threat = "Unauthorized Access Attack"
    # 3) DoS
    elif packet_rate > rules.packet_rate_dos:
        threat = "Denial of Service (DoS)"
    # 4) Command Injection
    elif cmd == "execute" and failed > rules.failed_commands_high:
        threat = "Command Injection"
    else:
        threat = "Normal"

    # Severity logic
    if firmware == 1 and unauthorized > 5:
        severity: Severity = "Critical"
    elif packet_rate > rules.packet_rate_dos or unauthorized > rules.unauthorized_access_attempts:
        severity = "High"
    elif failed > rules.failed_commands_high:
        severity = "Medium"
    else:
        severity = "Low"

    return (threat, severity)


def add_threat_labels(df: pd.DataFrame, rules: OTThreatRules = OTThreatRules()) -> pd.DataFrame:
    work = df.copy()
    labels = work.apply(lambda r: classify_threat(r, rules=rules), axis=1, result_type="expand")
    work["threat_type"] = labels[0].astype(str)
    work["severity"] = labels[1].astype(str)
    return work

