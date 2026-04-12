from __future__ import annotations

from src.shadow_it.shadow_alerts import generate_shadow_alerts
from src.shadow_it.shadow_data_simulator import ShadowSimConfig, generate_shadow_data
from src.shadow_it.shadow_detector import detect_shadow_it


def main() -> None:
    df = generate_shadow_data(ShadowSimConfig(devices=200, shadow_ratio=0.2))
    alerts = detect_shadow_it(df)

    if not alerts:
        print("No Shadow IT findings in this cycle.")
        return

    generate_shadow_alerts(alerts)


if __name__ == "__main__":
    main()

