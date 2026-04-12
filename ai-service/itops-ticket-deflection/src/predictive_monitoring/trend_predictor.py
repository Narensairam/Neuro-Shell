from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


@dataclass(frozen=True)
class TrendConfig:
    history_points: int = 30
    future_steps: int = 10
    cpu_threshold: float = 90.0
    mem_threshold: float = 85.0
    lat_threshold: float = 300.0
    err_threshold: float = 20.0


@dataclass(frozen=True)
class TrendAlert:
    server_id: str
    metric: str
    at_timestamp: str
    current_value: float
    predicted_peak: float
    threshold: float
    steps_to_breach: int
    business_impact: str
    action: str


def _predict_future(series: pd.Series, future_steps: int) -> np.ndarray:
    values = series.astype(float).to_numpy()
    X = np.arange(len(values)).reshape(-1, 1)
    model = LinearRegression()
    model.fit(X, values)
    future_X = np.arange(len(values), len(values) + future_steps).reshape(-1, 1)
    return model.predict(future_X)


def _impact_and_action(metric: str) -> tuple[str, str]:
    if metric == "cpu_usage":
        return (
            "Potential compute saturation and service degradation.",
            "Scale compute resources and investigate top CPU-consuming processes.",
        )
    if metric == "memory_usage":
        return (
            "Risk of memory exhaustion leading to instability or crashes.",
            "Restart leaking service and increase memory capacity if required.",
        )
    if metric == "network_latency":
        return (
            "Potential transaction slowdown and upstream service impact.",
            "Investigate network path and apply traffic shaping/failover as needed.",
        )
    return (
        "Rising application error risk and reliability degradation.",
        "Inspect logs, recent deployments, and remediate failing component early.",
    )


def predict_trend_risks(df: pd.DataFrame, config: TrendConfig = TrendConfig()) -> list[TrendAlert]:
    """
    Forecasts near-term threshold breaches per server using linear trend.
    Returns predictive alerts before hard anomalies occur.
    """
    work = df.copy()
    work["timestamp"] = pd.to_datetime(work["timestamp"], utc=True, errors="coerce")
    work.sort_values(["server_id", "timestamp"], inplace=True)

    metrics = [
        ("cpu_usage", config.cpu_threshold),
        ("memory_usage", config.mem_threshold),
        ("network_latency", config.lat_threshold),
        ("error_count", config.err_threshold),
    ]

    alerts: list[TrendAlert] = []
    for server_id, group in work.groupby("server_id", sort=False):
        if len(group) < max(8, config.history_points + config.future_steps):
            continue

        for metric, threshold in metrics:
            best: TrendAlert | None = None
            # rolling scan catches pre-breach trajectories across the full timeline
            for end_idx in range(config.history_points, len(group) - config.future_steps + 1, 5):
                hist = group.iloc[end_idx - config.history_points : end_idx]
                pred = _predict_future(hist[metric], future_steps=config.future_steps)
                breach = np.where(pred >= threshold)[0]
                if len(breach) == 0:
                    continue

                current_val = float(hist[metric].iloc[-1])
                if current_val >= threshold:
                    # skip already-breached points (not predictive)
                    continue

                steps = int(breach[0] + 1)
                impact, action = _impact_and_action(metric)
                candidate = TrendAlert(
                    server_id=str(server_id),
                    metric=metric,
                    at_timestamp=str(hist["timestamp"].iloc[-1]),
                    current_value=current_val,
                    predicted_peak=float(np.max(pred)),
                    threshold=float(threshold),
                    steps_to_breach=steps,
                    business_impact=impact,
                    action=action,
                )

                if best is None or candidate.steps_to_breach < best.steps_to_breach:
                    best = candidate

            if best is not None:
                alerts.append(best)

    return alerts

