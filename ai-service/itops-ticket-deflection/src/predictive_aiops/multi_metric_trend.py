from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_multi_metric(df: pd.DataFrame, future_steps: int = 10) -> dict[str, np.ndarray]:
    """
    Predicts next N points for cpu/memory/errors using linear regression.
    Input df columns expected: cpu, memory, errors
    """
    metrics = ["cpu", "memory", "errors"]
    predictions: dict[str, np.ndarray] = {}

    X = np.arange(len(df)).reshape(-1, 1)
    for metric in metrics:
        y = df[metric].astype(float).values
        model = LinearRegression()
        model.fit(X, y)

        future_X = np.arange(len(df), len(df) + future_steps).reshape(-1, 1)
        predictions[metric] = model.predict(future_X)

    return predictions

