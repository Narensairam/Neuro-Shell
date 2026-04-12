from __future__ import annotations

from typing import Literal, Tuple

import pandas as pd


IECCategory = Literal[
    "Identification & Authentication Control",
    "System Integrity",
    "Resource Availability",
    "None",
]

ComplianceRisk = Literal["Low", "Medium", "High"]


def map_to_iec_62443(threat_type: str) -> Tuple[IECCategory, ComplianceRisk]:
    mapping = {
        "Unauthorized Access Attack": ("Identification & Authentication Control", "High"),
        "Command Injection": ("System Integrity", "High"),
        "Denial of Service (DoS)": ("Resource Availability", "Medium"),
        "Firmware Tampering": ("System Integrity", "High"),
        "Normal": ("None", "Low"),
    }
    return mapping.get(threat_type, ("None", "Low"))


def add_compliance(df: pd.DataFrame) -> pd.DataFrame:
    work = df.copy()
    mapped = work["threat_type"].apply(map_to_iec_62443)
    work["iec_62443_category"] = mapped.apply(lambda x: x[0])
    work["compliance_risk"] = mapped.apply(lambda x: x[1])
    return work

