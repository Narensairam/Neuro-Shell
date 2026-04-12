from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional

import pandas as pd

from src.predictive_monitoring.features import FeatureConfig, build_features, model_matrix
from src.predictive_monitoring.model import AnomalyModel, ModelConfig
from src.predictive_monitoring.risk_engine import (
    RiskConfig,
    alert_message_and_action,
    severity_from_metrics,
)
from src.predictive_monitoring.schemas import Alert


ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class PipelineConfig:
    feature: FeatureConfig = FeatureConfig()
    model: ModelConfig = ModelConfig()
    risk: RiskConfig = RiskConfig()


class PredictiveMonitoringPipeline:
    def __init__(self, config: PipelineConfig = PipelineConfig()):
        self.config = config
        self.model = AnomalyModel(config.model)
        self._fit = False

    def load_csv(self, path: Path | None = None) -> pd.DataFrame:
        path = path or (ROOT / "data" / "infra_metrics.csv")
        return pd.read_csv(path)

    def fit(self, df: pd.DataFrame) -> None:
        feats = build_features(df, self.config.feature)
        X = model_matrix(feats)
        self.model.fit(X)
        self._fit = True

    def score_latest(self, df: pd.DataFrame, per_server: int = 1) -> List[Alert]:
        if not self._fit:
            raise RuntimeError("Pipeline not fit. Call fit() first.")

        feats = build_features(df, self.config.feature)

        # latest points per server
        feats["timestamp"] = pd.to_datetime(feats["timestamp"], utc=True, errors="coerce")
        feats.sort_values(["server_id", "timestamp"], inplace=True)
        latest = feats.groupby("server_id", sort=False).tail(per_server)

        X_latest = model_matrix(latest)
        scores = self.model.score(X_latest)
        threshold = self.model.threshold()
        anomalies = scores >= threshold

        alerts: list[Alert] = []
        for idx, row in latest.reset_index(drop=True).iterrows():
            anomaly = bool(anomalies[idx])
            score = float(scores[idx])
            severity, confidence = severity_from_metrics(
                row, anomaly=anomaly, score=score, threshold=threshold, config=self.config.risk
            )
            message, action, root_cause, component = alert_message_and_action(
                row, severity=severity, config=self.config.risk
            )

            ts: datetime = row["timestamp"].to_pydatetime()
            alerts.append(
                Alert(
                    timestamp=ts,
                    server_id=str(row["server_id"]),
                    severity=severity,
                    anomaly=anomaly,
                    score=score,
                    confidence=float(confidence),
                    message=message,
                    action=action,
                    root_cause=root_cause,
                    component=component,
                    cpu=float(row["cpu_usage"]),
                    mem=float(row["memory_usage"]),
                    lat=float(row["network_latency"]),
                    err=int(row["error_count"]),
                )
            )

        return alerts

    @staticmethod
    def format_alerts(alerts: Iterable[Alert]) -> str:
        lines: list[str] = []
        order = {"Critical": 3, "High": 2, "Warning": 1, "Info": 0}
        for a in sorted(alerts, key=lambda x: (order[x.severity], x.confidence), reverse=True):
            lines.append(
                f"[{a.severity}] {a.server_id} | CPU={a.cpu:.0f} MEM={a.mem:.0f} LAT={a.lat:.0f} ERR={a.err} "
                f"| anomaly={a.anomaly} score={a.score:.3f}"
            )
            if a.anomaly:
                lines.append("-> Anomaly Detected")
                lines.append(f"-> {a.message}")
                lines.append(f"-> Suggested Action: {a.action}")
                if a.root_cause:
                    lines.append(f"-> Root-cause Hint: {a.root_cause} ({a.component})")
            else:
                lines.append("-> System operating normally")
        return "\n".join(lines)

