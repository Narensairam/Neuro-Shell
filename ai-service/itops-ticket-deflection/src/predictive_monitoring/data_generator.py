from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"


@dataclass(frozen=True)
class GeneratorConfig:
    """Enterprise demo defaults: 10-12 servers, ~17% row-level anomalies, tiered server health."""

    servers: int = 12
    points_per_server: int = 24 * 60  # 1 day at 1-min resolution
    freq_seconds: int = 60
    seed: int = 42

    # 15-20% of rows carry injected spikes (RFP demo: always some red/yellow signals)
    anomaly_ratio: float = 0.17

    # Percentage of series that shows gradual degradation trend
    degradation_ratio: float = 0.20

    # Hard anomaly thresholds (RFP-friendly, interpretable)
    cpu_anom: float = 90.0
    mem_anom: float = 85.0
    lat_anom: float = 300.0
    err_anom: int = 20


def _clip(x, lo, hi):
    return float(np.clip(x, lo, hi))


def _server_tier(server_index: int, servers: int) -> str:
    """
    Most servers healthy; 2-3 elevated for demo (warning/critical).
    ~75% healthy, ~17% warning, ~8% critical (minimum 1 critical if servers >= 10).
    """
    if servers < 4:
        return "healthy"
    n_crit = max(1, min(2, servers // 6))
    n_warn = max(2, min(3, servers // 4))
    if server_index >= servers - n_crit:
        return "critical"
    if server_index >= servers - n_crit - n_warn:
        return "warning"
    return "healthy"


def generate_infra_metrics(config: GeneratorConfig) -> pd.DataFrame:
    """
    Generates realistic infra telemetry with:
      - stable baseline + noise
      - gradual degradation windows (trend increase)
      - injected hard anomalies in ~10-15% of rows (CPU/MEM/LAT/ERR)

    Output columns (minimum): timestamp, server_id, cpu_usage, memory_usage, disk_usage, network_latency, error_count
    """
    rng = np.random.default_rng(config.seed)
    base_time = datetime.now(timezone.utc) - timedelta(
        seconds=config.points_per_server * config.freq_seconds
    )

    rows: list[dict] = []

    for s in range(config.servers):
        server_id = f"srv_{101 + s}"
        tier = _server_tier(s, config.servers)

        n = config.points_per_server
        # Baselines per tier (heterogeneous fleet — most normal, few hot)
        if tier == "healthy":
            cpu_base = float(rng.uniform(18, 42))
            mem_base = float(rng.uniform(28, 55))
            disk_base = float(rng.uniform(38, 72))
            latency_base = float(rng.uniform(18, 95))
            err_base = float(rng.uniform(0.3, 1.8))
            row_anom_ratio = config.anomaly_ratio * 0.85
        elif tier == "warning":
            cpu_base = float(rng.uniform(38, 62))
            mem_base = float(rng.uniform(48, 72))
            disk_base = float(rng.uniform(45, 78))
            latency_base = float(rng.uniform(45, 160))
            err_base = float(rng.uniform(1.5, 5.0))
            row_anom_ratio = config.anomaly_ratio * 1.1
        else:
            cpu_base = float(rng.uniform(48, 68))
            mem_base = float(rng.uniform(55, 78))
            disk_base = float(rng.uniform(50, 82))
            latency_base = float(rng.uniform(60, 200))
            err_base = float(rng.uniform(3.0, 8.0))
            row_anom_ratio = config.anomaly_ratio * 1.25

        # Degradation window (trend increase) — stronger on warning/critical
        deg_len = max(20, int(n * config.degradation_ratio))
        if tier == "healthy":
            deg_start = int(rng.integers(low=int(n * 0.35), high=int(n * 0.72)))
        else:
            deg_start = int(rng.integers(low=int(n * 0.25), high=int(n * 0.55)))
        deg_end = min(n, deg_start + deg_len)

        # Inject anomalies: spread across timeline (~15-20% of rows)
        anom_count = max(5, int(n * row_anom_ratio))
        anom_indices = set(rng.choice(np.arange(n), size=min(anom_count, n), replace=False).tolist())

        for i in range(n):
            ts = base_time + timedelta(seconds=i * config.freq_seconds)

            degrading = deg_start <= i < deg_end
            deg_progress = 0.0
            if degrading:
                deg_progress = (i - deg_start) / max(1, (deg_len - 1))

            # Tier multiplier for sustained pressure on warning/critical servers
            tier_boost = {"healthy": 1.0, "warning": 1.5, "critical": 1.95}[tier]

            # Baseline + noise + stochastic jumps
            cpu = cpu_base + rng.normal(0, 8) + (deg_progress * rng.uniform(15, 35) * tier_boost)
            mem = mem_base + rng.normal(0, 5) + (deg_progress * rng.uniform(10, 30) * tier_boost)
            disk_usage = disk_base + rng.normal(0, 2) + (deg_progress * rng.uniform(2, 12))
            net_latency = latency_base + rng.normal(0, 25) + (deg_progress * rng.uniform(50, 220) * tier_boost)
            error_count = int(max(0.0, rng.poisson(err_base + deg_progress * rng.uniform(2.0, 12.0) * tier_boost)))

            # Random "Bursty" spikes (The "Unstable" Production feel)
            if rng.random() < 0.08: # 8% chance of a random burst
                cpu += rng.uniform(15, 30)
                net_latency += rng.uniform(100, 300)
                error_count += int(rng.integers(5, 15))

            # Late-window escalation for warning/critical (predictive story: trend toward breach)
            late_frac = i / max(1, n - 1)
            if tier == "warning" and late_frac > 0.65:
                cpu += rng.uniform(12, 28)
                mem += rng.uniform(8, 22)
                error_count += int(rng.integers(2, 6))
            if tier == "critical" and late_frac > 0.55:
                cpu += rng.uniform(25, 45)
                mem += rng.uniform(18, 35)
                error_count += int(rng.integers(5, 20))

            # Inject hard anomalies meeting thresholds in ~15-20% of rows
            if i in anom_indices:
                # Choose 1-3 anomaly types per event (critical when multiple)
                k = int(rng.integers(1, 4))
                kinds = rng.choice(["cpu", "mem", "lat", "err"], size=k, replace=False)
                if "cpu" in kinds:
                    cpu = max(cpu, config.cpu_anom + float(rng.uniform(0, 8)))
                if "mem" in kinds:
                    mem = max(mem, config.mem_anom + float(rng.uniform(0, 8)))
                if "lat" in kinds:
                    net_latency = max(net_latency, config.lat_anom + float(rng.uniform(0, 180)))
                if "err" in kinds:
                    error_count = max(error_count, int(config.err_anom + rng.integers(0, 30)))

            rows.append(
                {
                    "timestamp": ts.isoformat(),
                    "server_id": server_id,
                    "cpu_usage": _clip(cpu, 0, 100),
                    "memory_usage": _clip(mem, 0, 100),
                    "disk_usage": _clip(disk_usage, 0, 100),
                    "network_latency": max(0.0, float(net_latency)),
                    "error_count": int(error_count),
                }
            )

    df = pd.DataFrame(rows)
    df.sort_values(["server_id", "timestamp"], inplace=True)
    return df


def write_infra_csv(path: Path, df: pd.DataFrame) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)


def main() -> None:
    config = GeneratorConfig()
    df = generate_infra_metrics(config)
    out = DATA_DIR / "infra_metrics.csv"
    write_infra_csv(out, df)
    print("Infra metrics generated!")
    print(f"  - {out}")
    print(f"  - rows={len(df):,} servers={config.servers} points_per_server={config.points_per_server}")


if __name__ == "__main__":
    main()

