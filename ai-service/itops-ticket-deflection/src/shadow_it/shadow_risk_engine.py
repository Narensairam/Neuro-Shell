from __future__ import annotations

from typing import Literal

import pandas as pd


Severity = Literal["Low", "Medium", "High"]


def calculate_risk(row: pd.Series, reason: str | None = None) -> Severity:
    score = int(row.get("risk_score", 0))

    if score >= 80:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"

