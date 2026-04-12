from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


@dataclass(frozen=True)
class ModelConfig:
    # Expected anomaly rate (align with synthetic injection: ~10-15%)
    contamination: float = 0.12
    random_state: int = 42
    n_estimators: int = 250
    # Explicit threshold quantile for anomaly score (higher = more anomalous)
    anomaly_threshold_quantile: float = 0.88


class AnomalyModel:
    """
    Unsupervised anomaly model:
      - StandardScaler normalization (enterprise baseline)
      - IsolationForest as credible AIOps baseline
      - Explicit anomaly threshold derived from training-score quantile
    """

    def __init__(self, config: ModelConfig = ModelConfig()):
        self.config = config
        self.scaler = StandardScaler()
        self.model = IsolationForest(
            n_estimators=config.n_estimators,
            contamination=config.contamination,
            random_state=config.random_state,
            n_jobs=1,
        )
        self._is_fit = False
        self.anomaly_threshold_: float | None = None

    def fit(self, X: pd.DataFrame) -> None:
        Xs = self.scaler.fit_transform(X)
        self.model.fit(Xs)
        scores = self._score_scaled(Xs)
        self.anomaly_threshold_ = float(
            np.quantile(scores, self.config.anomaly_threshold_quantile)
        )
        self._is_fit = True

    def _score_scaled(self, Xs: np.ndarray) -> np.ndarray:
        # decision_function: higher = more normal; invert so higher = more anomalous
        normality = self.model.decision_function(Xs)
        return -normality

    def score(self, X: pd.DataFrame) -> np.ndarray:
        if not self._is_fit:
            raise RuntimeError("Model is not fit. Call fit() first.")
        Xs = self.scaler.transform(X)
        return self._score_scaled(Xs)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if not self._is_fit:
            raise RuntimeError("Model is not fit. Call fit() first.")
        if self.anomaly_threshold_ is None:
            raise RuntimeError("Anomaly threshold not set. Call fit() first.")
        scores = self.score(X)
        return scores >= self.anomaly_threshold_

    def threshold(self) -> float:
        if self.anomaly_threshold_ is None:
            raise RuntimeError("Anomaly threshold not set. Call fit() first.")
        return float(self.anomaly_threshold_)

