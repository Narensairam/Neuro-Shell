from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import numpy as np
import pandas as pd


METRIC_COLS: Sequence[str] = (
    "cpu_usage",
    "memory_usage",
    "disk_usage",
    "network_latency",
    "error_count",
)


@dataclass(frozen=True)
class FeatureConfig:
    rolling_window: int = 5  # 5 minutes at 1-min resolution


def _rate_of_change(series: pd.Series) -> pd.Series:
    return series.diff()


def build_features(df: pd.DataFrame, config: FeatureConfig = FeatureConfig()) -> pd.DataFrame:
    """
    Input df columns: timestamp, server_id, metrics...
    Output includes rolling means, deltas, and simple spike flags.
    """
    work = df.copy()
    work["timestamp"] = pd.to_datetime(work["timestamp"], utc=True, errors="coerce")
    work.sort_values(["server_id", "timestamp"], inplace=True)

    grouped = work.groupby("server_id", sort=False)

    for col in METRIC_COLS:
        work[f"{col}_roll{config.rolling_window}"] = grouped[col].transform(
            lambda s: s.rolling(config.rolling_window, min_periods=1).mean()
        )
        work[f"{col}_delta"] = grouped[col].transform(_rate_of_change).fillna(0.0)

        # Spike proxy: delta beyond robust threshold (median + 3*MAD)
        def spike_flag(s: pd.Series) -> pd.Series:
            d = s.diff().fillna(0.0)
            med = float(np.median(d))
            mad = float(np.median(np.abs(d - med))) or 1e-6
            return (np.abs(d - med) > (3.0 * 1.4826 * mad)).astype(int)

        work[f"{col}_spike"] = grouped[col].transform(spike_flag)

    return work


def model_matrix(feature_df: pd.DataFrame) -> pd.DataFrame:
    feature_cols = []
    for col in METRIC_COLS:
        feature_cols.extend(
            [
                col,
                f"{col}_roll5",
                f"{col}_delta",
                f"{col}_spike",
            ]
        )
    return feature_df[feature_cols].astype(float)

