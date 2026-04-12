from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

import pandas as pd

from src.predictive_monitoring.schemas import RiskLevel


@dataclass(frozen=True)
class RiskConfig:
    # Hard thresholds aligned to generator injection + RFP requirements
    cpu_high: float = 90.0
    mem_high: float = 85.0
    latency_high: float = 300.0
    error_high: int = 20


def _high_metrics(row: pd.Series, config: RiskConfig) -> list[str]:
    hits: list[str] = []
    if float(row["cpu_usage"]) >= config.cpu_high:
        hits.append("CPU")
    if float(row["memory_usage"]) >= config.mem_high:
        hits.append("MEM")
    if float(row["network_latency"]) >= config.latency_high:
        hits.append("LAT")
    if int(row["error_count"]) >= config.error_high:
        hits.append("ERR")
    return hits


def severity_from_metrics(
    row: pd.Series,
    anomaly: bool,
    score: float,
    threshold: float,
    config: RiskConfig = RiskConfig(),
) -> tuple[RiskLevel, float]:
    """
    Severity classification (consistent with anomaly flag):
      - Info: anomaly=False
      - Warning: anomaly=True but not high/critical
      - High: anomaly=True and CPU or MEM is high
      - Critical: anomaly=True and 2+ metrics are high
    Returns (severity, confidence) where confidence is a light proxy.
    """
    if not anomaly:
        return ("Info", 0.0)

    hits = _high_metrics(row, config)
    if len(hits) >= 2:
        sev: RiskLevel = "Critical"
    elif "CPU" in hits or "MEM" in hits:
        sev = "High"
    else:
        sev = "Warning"

    # confidence is derived from how far above threshold we are
    denom = max(1e-6, abs(threshold))
    conf = 0.5 + min(0.49, max(0.0, (score - threshold) / denom) * 0.25)
    return (sev, float(conf))


def alert_message_and_action(
    row: pd.Series,
    severity: RiskLevel,
    config: RiskConfig = RiskConfig(),
) -> tuple[str, str, Optional[str], Optional[str]]:
    """
    Returns (message, action, root_cause_hint, component)
    """
    if severity == "Info":
        return ("System operating normally", "No action required", None, None)

    hits = _high_metrics(row, config)
    cpu = float(row["cpu_usage"])
    mem = float(row["memory_usage"])
    lat = float(row["network_latency"])
    err = int(row["error_count"])

    parts: list[str] = []
    if "CPU" in hits:
        parts.append(f"High CPU usage ({cpu:.0f}%)")
    if "MEM" in hits:
        parts.append(f"High memory usage ({mem:.0f}%)")
    if "LAT" in hits:
        parts.append(f"High latency ({lat:.0f}ms)")
    if "ERR" in hits:
        parts.append(f"High error count ({err})")

    message = " and ".join(parts) if parts else "Telemetry anomaly detected"

    if "CPU" in hits:
        return (
            message,
            "Scale up/out or restart the top CPU-consuming service after validation",
            "Resource pressure",
            "Compute layer",
        )
    if "MEM" in hits:
        return (
            message,
            "Restart the leaking process/service and validate memory returns to baseline",
            "Memory pressure / leak",
            "Compute layer",
        )
    if "LAT" in hits:
        return (
            message,
            "Check network path (DNS, routing, firewall) and upstream dependencies; fail over if possible",
            "Network degradation",
            "Network layer",
        )
    if "ERR" in hits:
        return (
            message,
            "Inspect logs and recent deployments; consider rollback or targeted restart",
            "Service instability",
            "Service layer",
        )

    return (message, "Investigate telemetry and correlated changes", None, None)

