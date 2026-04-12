from __future__ import annotations

from typing import List, Tuple

import pandas as pd

from src.shadow_it.shadow_risk_engine import Severity, calculate_risk


Reason = str


def detect_shadow_it(df: pd.DataFrame) -> List[Tuple[pd.Series, Reason, Severity]]:
    """
    Detect Shadow IT candidates based on:
      - known == 0 (unmanaged)
      - abnormal network activity
    Returns list of (row, reason, severity).
    """
    alerts: list[tuple[pd.Series, Reason, Severity]] = []

    for _, row in df.iterrows():
        reason: str | None = None

        if int(row["known"]) == 0:
            reason = "Unknown / unmanaged device"
        elif float(row["network_activity"]) > 8000:
            reason = "Abnormal network usage"

        if not reason:
            continue

        severity = calculate_risk(row, reason)
        alerts.append((row, reason, severity))

    return alerts

