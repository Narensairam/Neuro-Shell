from __future__ import annotations

from src.agent import TicketAgent
from src.ot_security.ot_alert_engine import build_ot_alert, format_ot_alert
from src.ot_security.ot_anomaly_detector import detect_ot_anomalies
from src.ot_security.ot_compliance_mapper import add_compliance
from src.ot_security.ot_data_simulator import OTSimConfig, simulate_ot_telemetry
from src.ot_security.ot_kb import load_ot_kb
from src.ot_security.ot_threat_classifier import add_threat_labels


def main() -> None:
    # 1) Simulate OT telemetry
    df = simulate_ot_telemetry(OTSimConfig(devices=100, points_per_device=60, anomaly_ratio=0.12))

    # 2) Detect anomalies
    scored = detect_ot_anomalies(df)

    # 3) Classify threats + map IEC 62443
    labeled = add_threat_labels(scored)
    enriched = add_compliance(labeled)

    # 4) Train ticket agent on OT KB (domain-aligned)
    kb_texts, resolutions = load_ot_kb()
    agent = TicketAgent(threshold=0.35)
    agent.train(kb_texts, resolutions)

    # 5) Pick top threats (Medium+), aggregate per device, print alerts, create tickets (only Medium/High/Critical)
    severity_order = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    threats = enriched[enriched["anomaly"]].copy()
    threats = threats[threats["threat_type"] != "Normal"]

    if threats.empty:
        print("No OT threats detected in this run.")
        return

    # Count occurrences and keep highest severity/score per device
    threats["occurrence_count"] = threats.groupby("device_id")["device_id"].transform("count")
    threats["sev_rank"] = threats["severity"].map(severity_order).fillna(0).astype(int)
    threats = threats.sort_values(["sev_rank", "score"], ascending=[False, False])
    threats = threats.drop_duplicates(subset=["device_id"])

    # Sort devices by severity (Critical > High > Medium > Low)
    threats = threats.sort_values(["sev_rank", "score"], ascending=[False, False])

    for _, row in threats.iterrows():
        alert = build_ot_alert(row)
        print(format_ot_alert(alert))

        if alert.severity == "Low":
            print("Ticket: (skipped - low severity)\n")
            continue

        title = f"{alert.severity} {alert.threat_type} on {alert.device_id}"
        description = (
            f"IEC 62443: {alert.iec_62443_category}\n"
            f"Occurrences: {alert.occurrence_count}\n"
            f"Reasons: {'; '.join(alert.explanation)}\n"
            f"Action: {alert.action}\n"
        )
        result = agent.handle_ticket(title + " " + description)

        print(f"Ticket: created ({title})")
        print(f"Ticket Status: {result['status']}")
        if result["status"] == "Deflected":
            print(f"Resolution: {result['solution']}")
        print()


if __name__ == "__main__":
    main()

