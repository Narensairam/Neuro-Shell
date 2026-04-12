from __future__ import annotations

import numpy as np


def calculate_failure_probability(predictions: dict[str, np.ndarray]) -> int:
    risk_score = 0

    if float(np.max(predictions["cpu"])) > 90:
        risk_score += 40
    if float(np.max(predictions["memory"])) > 90:
        risk_score += 30
    if float(np.max(predictions["errors"])) > 20:
        risk_score += 30

    return int(min(risk_score, 100))

