from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class OTSimConfig:
    devices: int = 80
    points_per_device: int = 60  # 1 hour @ 1-min resolution (demo-friendly)
    freq_seconds: int = 60
    seed: int = 7
    # Row-level noise; showcase threats added via _guarantee_soc_showcase
    anomaly_ratio: float = 0.16


PROTOCOLS = ("Modbus", "OPC-UA", "DNP3")
COMMAND_TYPES = ("read", "write", "execute")


def simulate_ot_telemetry(config: OTSimConfig = OTSimConfig()) -> pd.DataFrame:
    """
    Synthetic OT telemetry for PLC/RTU-style devices.
    Injects 10-15% anomalies representing threats:
      - packet_rate > 500 (DoS-like)
      - unauthorized_access_attempts > 3
      - firmware_change_flag == 1
      - failed_commands > 10
    Also includes a mild degradation trend (packet_rate increasing) for a subset.
    """
    rng = np.random.default_rng(config.seed)
    base_time = datetime.now(timezone.utc) - timedelta(
        seconds=config.devices * config.points_per_device * config.freq_seconds
    )

    rows: list[dict] = []

    for d in range(config.devices):
        device_id = f"plc_{d+1:03d}"
        protocol = str(rng.choice(PROTOCOLS, p=[0.55, 0.30, 0.15]))

        # baseline behavior per device
        packet_base = float(rng.uniform(60, 160))
        fail_base = float(rng.uniform(0.0, 2.0))

        n = config.points_per_device
        anom_count = int(n * config.anomaly_ratio)
        anom_indices = set(rng.choice(np.arange(n), size=anom_count, replace=False).tolist())

        # mild degradation window (trend)
        deg_len = max(8, int(n * 0.25))
        deg_start = int(rng.integers(low=int(n * 0.25), high=int(n * 0.65)))
        deg_end = min(n, deg_start + deg_len)

        for i in range(n):
            ts = base_time + timedelta(seconds=(d * n + i) * config.freq_seconds)

            # choose command distribution by protocol (approx realistic)
            if protocol == "Modbus":
                cmd = str(rng.choice(COMMAND_TYPES, p=[0.75, 0.23, 0.02]))
            elif protocol == "OPC-UA":
                cmd = str(rng.choice(COMMAND_TYPES, p=[0.70, 0.25, 0.05]))
            else:
                cmd = str(rng.choice(COMMAND_TYPES, p=[0.78, 0.20, 0.02]))

            degrading = deg_start <= i < deg_end
            deg_progress = 0.0
            if degrading:
                deg_progress = (i - deg_start) / max(1, (deg_len - 1))

            packet_rate = packet_base + rng.normal(0, 20) + (deg_progress * rng.uniform(30, 120))
            failed_commands = int(max(0.0, rng.poisson(fail_base + deg_progress * rng.uniform(0.5, 2.0))))
            unauthorized = 0
            firmware_change = 0

            # threat injection
            if i in anom_indices:
                k = int(rng.integers(1, 4))
                kinds = rng.choice(["dos", "unauth", "fw", "fail"], size=k, replace=False)
                if "dos" in kinds:
                    packet_rate = max(packet_rate, float(rng.uniform(520, 1200)))
                if "unauth" in kinds:
                    unauthorized = int(rng.integers(4, 10))
                if "fw" in kinds:
                    firmware_change = 1
                if "fail" in kinds:
                    failed_commands = max(failed_commands, int(rng.integers(11, 40)))

                # threats often correlate with execute attempts
                if "fail" in kinds and rng.random() < 0.35:
                    cmd = "execute"

            rows.append(
                {
                    "timestamp": ts.isoformat(),
                    "device_id": device_id,
                    "protocol": protocol,
                    "packet_rate": float(max(0.0, packet_rate)),
                    "command_type": cmd,
                    "failed_commands": int(failed_commands),
                    "unauthorized_access_attempts": int(unauthorized),
                    "firmware_change_flag": int(firmware_change),
                }
            )

    df = pd.DataFrame(rows)
    df.sort_values(["device_id", "timestamp"], inplace=True)
    return _guarantee_soc_showcase(df, rng)


def _guarantee_soc_showcase(df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    Ensures every demo run includes visible SOC narrative:
    - 2 CRITICAL (firmware / command injection)
    - 3 HIGH (DoS, unauthorized access)
    Remaining ~80%+ traffic stays normal.
    """
    work = df.copy()

    # plc_001, plc_002 — CRITICAL firmware tampering
    for dev in ("plc_001", "plc_002"):
        m = work["device_id"] == dev
        if m.any():
            work.loc[m, "firmware_change_flag"] = 0
            tail = work.loc[m].sort_values("timestamp").tail(5).index
            work.loc[tail, "firmware_change_flag"] = 1
            work.loc[tail, "failed_commands"] = work.loc[tail, "failed_commands"].clip(lower=15)
            work.loc[tail, "packet_rate"] = work.loc[tail, "packet_rate"].clip(lower=650)

    # plc_003 — HIGH DoS
    m3 = work["device_id"] == "plc_003"
    if m3.any():
        tail = work.loc[m3].sort_values("timestamp").tail(10).index
        work.loc[tail, "packet_rate"] = rng.uniform(720, 1100, size=len(tail)).astype(float)
        work.loc[tail, "firmware_change_flag"] = 0

    # plc_004, plc_005 — HIGH unauthorized access
    for dev in ("plc_004", "plc_005"):
        m = work["device_id"] == dev
        if m.any():
            tail = work.loc[m].sort_values("timestamp").tail(8).index
            work.loc[tail, "unauthorized_access_attempts"] = rng.integers(6, 12, size=len(tail)).astype(int)
            work.loc[tail, "firmware_change_flag"] = 0

    return work.sort_values(["device_id", "timestamp"]).reset_index(drop=True)

