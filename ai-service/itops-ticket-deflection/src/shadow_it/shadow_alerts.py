from __future__ import annotations

from typing import Iterable, Tuple

import pandas as pd

from src.shadow_it.shadow_risk_engine import Severity


def _business_impact() -> list[str]:
    return [
        "Potential unauthorized access point into the environment.",
        "Increased cybersecurity and compliance risk due to unmanaged assets.",
    ]


def generate_shadow_alerts(alerts: Iterable[Tuple[pd.Series, str, Severity]]) -> None:
    for row, reason, severity in alerts:
        device = row["device_id"]
        location = row["location"]
        known = int(row["known"])

        print("\n[SHADOW IT ALERT]")
        print(f"Device: {device}")
        print(f"Location: {location}")
        print(f"Issue: {reason}")
        print(f"Severity: {severity}")

        print("\nWhy:")
        if known == 0:
            print("- Device not registered in asset inventory.")
        if float(row["network_activity"]) > 8000:
            print("- Unusually high network activity observed.")
        if int(row["access_frequency"]) > 40:
            print("- High access frequency compared to typical managed assets.")

        print("\nBusiness Impact:")
        for line in _business_impact():
            print(f"- {line}")

        print("\nRecommended Action:")
        print("- Investigate device owner and usage.")
        print("- Add device to asset inventory or block network access if unauthorized.")

        # For now we just mark ticket as created/deflected; could be wired to TicketAgent later.
        print("\n-> Ticket: Created | Status: Deflected")

