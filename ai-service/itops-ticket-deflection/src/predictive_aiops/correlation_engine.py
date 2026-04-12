from __future__ import annotations

import numpy as np


def generate_aiops_insight(current: dict, predictions: dict[str, np.ndarray], risk_score: int) -> str:
    lines = [
        "",
        "[CRITICAL + PREDICTIVE RISK]",
        "",
        f"Server: {current['server']}",
        "",
        "Current State:",
        f"- CPU: {current['cpu']:.1f}%",
        f"- Memory: {current['memory']:.1f}%",
        f"- Errors: {current['errors']:.1f}",
        "",
        "Future Risk:",
        f"- CPU peak: {float(np.max(predictions['cpu'])):.1f}",
        f"- Memory peak: {float(np.max(predictions['memory'])):.1f}",
        f"- Errors peak: {float(np.max(predictions['errors'])):.1f}",
        "",
        f"Failure Probability: {risk_score}%",
        "",
        "Insight:",
        "- Current anomalies and trend forecast indicate sustained stress likely to degrade service.",
        "",
        "Recommended Action:",
        "- Scale resources immediately.",
        "- Investigate rising error sources and recent changes.",
    ]
    return "\n".join(lines)

