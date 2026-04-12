from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder, StandardScaler


@dataclass(frozen=True)
class OTAnomalyConfig:
    contamination: float = 0.12
    random_state: int = 7
    n_estimators: int = 300
    anomaly_threshold_quantile: float = 0.88


def _build_feature_matrix(df: pd.DataFrame) -> tuple[np.ndarray, list[str]]:
    cat = df[["protocol", "command_type"]].astype(str)
    num = df[
        [
            "packet_rate",
            "failed_commands",
            "unauthorized_access_attempts",
            "firmware_change_flag",
        ]
    ].astype(float)

    ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    cat_enc = ohe.fit_transform(cat)
    cat_names = [f"cat_{c}" for c in ohe.get_feature_names_out(["protocol", "command_type"]).tolist()]

    X = np.concatenate([num.to_numpy(), cat_enc], axis=1)
    names = list(num.columns) + cat_names
    return X, names


def detect_ot_anomalies(df: pd.DataFrame, config: OTAnomalyConfig = OTAnomalyConfig()) -> pd.DataFrame:
    """
    IsolationForest anomaly detection for OT telemetry.
    Output columns:
      - anomaly (bool)
      - score (float; higher = more anomalous)
    """
    work = df.copy()

    X, _ = _build_feature_matrix(work)
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=config.n_estimators,
        contamination=config.contamination,
        random_state=config.random_state,
        n_jobs=1,
    )
    model.fit(Xs)

    # higher = more anomalous
    score = -model.decision_function(Xs)
    threshold = float(np.quantile(score, config.anomaly_threshold_quantile))
    anomaly = score >= threshold

    work["score"] = score.astype(float)
    work["anomaly"] = anomaly.astype(bool)
    work["threshold"] = float(threshold)
    return work

