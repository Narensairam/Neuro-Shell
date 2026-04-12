from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


RiskLevel = Literal["Info", "Warning", "High", "Critical"]


@dataclass(frozen=True)
class Alert:
    timestamp: datetime
    server_id: str
    severity: RiskLevel
    anomaly: bool
    score: float
    confidence: float
    message: str
    action: str
    root_cause: Optional[str]
    component: Optional[str]

    cpu: float
    mem: float
    lat: float
    err: int

