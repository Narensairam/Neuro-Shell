from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.agent import TicketAgent
from src.predictive_aiops.correlation_engine import generate_aiops_insight
from src.predictive_aiops.failure_risk import calculate_failure_probability
from src.predictive_aiops.multi_metric_trend import predict_multi_metric
from src.predictive_monitoring.data_generator import GeneratorConfig, generate_infra_metrics, write_infra_csv
from src.predictive_monitoring.infra_kb import load_infra_kb
from src.predictive_monitoring.pipeline import PredictiveMonitoringPipeline
from src.predictive_monitoring.ticket_integration import run_closed_loop
from src.predictive_monitoring.trend_predictor import TrendConfig, predict_trend_risks


ROOT = Path(__file__).resolve().parent


def main() -> None:
    # 1) Generate realistic synthetic telemetry
    infra_df = generate_infra_metrics(
        GeneratorConfig(servers=6, points_per_server=24 * 60, anomaly_ratio=0.12, degradation_ratio=0.20)
    )
    infra_path = ROOT / "data" / "infra_metrics.csv"
    write_infra_csv(infra_path, infra_df)

    # 2) Fit anomaly detection + score latest points
    pipeline = PredictiveMonitoringPipeline()
    pipeline.fit(infra_df)
    alerts = pipeline.score_latest(infra_df, per_server=1)
    print("\n=== Predictive Monitoring Alerts ===\n")
    print(pipeline.format_alerts(alerts))

    # 2b) Trend forecasting (pre-anomaly predictive layer)
    trend_alerts = predict_trend_risks(infra_df, TrendConfig(history_points=30, future_steps=10))
    print("\n=== Trend Prediction Alerts ===\n")
    if not trend_alerts:
        print("No near-term threshold breaches predicted.")
    else:
        for t in trend_alerts[:6]:
            metric_name = t.metric.replace("_", " ").title()
            print("[PREDICTIVE ALERT]")
            print(f"Server: {t.server_id}")
            print(f"Observed At: {t.at_timestamp}")
            print(f"Metric: {metric_name}")
            print(f"Current Value: {t.current_value:.1f}")
            print(
                f"Prediction: {metric_name} expected to cross {t.threshold:.1f} "
                f"in ~{t.steps_to_breach} minutes (peak {t.predicted_peak:.1f})"
            )
            print("Business Impact:")
            print(f"- {t.business_impact}")
            print("Recommended Action:")
            print(f"- {t.action}")
            print()

    # 3) Train ticket agent on INFRA KB (domain-aligned deflection)
    kb_texts, resolutions = load_infra_kb()
    ticket_agent = TicketAgent(threshold=0.35)
    ticket_agent.train(kb_texts, resolutions)

    print("\n=== Closed-loop AIOps (Alert -> Ticket -> TicketAgent) ===\n")
    order = {"Critical": 3, "High": 2, "Warning": 1, "Info": 0}
    riskiest = sorted(alerts, key=lambda a: (order[a.severity], a.confidence), reverse=True)[0]
    routed = run_closed_loop(riskiest, ticket_agent)

    print(
        f"\n[{riskiest.severity}] {riskiest.server_id} | CPU={riskiest.cpu:.0f} MEM={riskiest.mem:.0f} "
        f"LAT={riskiest.lat:.0f} ERR={riskiest.err}"
    )
    if riskiest.anomaly:
        print("-> Anomaly Detected")
        print(f"-> {riskiest.message}")
        print(f"-> Suggested Action: {riskiest.action}")
    else:
        print("-> System operating normally")

    if routed.get("ticket") is None:
        print("-> Ticket: (skipped)")
    else:
        status = routed["ticket_agent_result"]["status"]
        print(f"-> Ticket: created ({routed['ticket']['title']})")
        print(f"-> Ticket Status: {status}")
        if status == "Deflected":
            print(f"-> Resolution: {routed['ticket_agent_result']['solution']}")

    # 4) Optional preventive ticket from trend prediction
    if trend_alerts:
        top = sorted(
            trend_alerts,
            key=lambda x: (x.steps_to_breach, -x.predicted_peak),
        )[0]
        trend_title = f"Predictive risk on {top.server_id}: {top.metric.replace('_', ' ')} rising"
        trend_text = (
            f"{trend_title}. Predicted breach in ~{top.steps_to_breach} minutes. "
            f"Current={top.current_value:.1f}, peak={top.predicted_peak:.1f}, "
            f"threshold={top.threshold:.1f}. Action: {top.action}"
        )
        trend_result = ticket_agent.handle_ticket(trend_text)
        print("\n=== Preventive Ticket (Trend Forecast) ===\n")
        print(f"-> Ticket: created ({trend_title})")
        print(f"-> Ticket Status: {trend_result['status']}")
        if trend_result["status"] == "Deflected":
            print(f"-> Resolution: {trend_result['solution']}")

    # 5) Multi-metric predictive AIOps correlation insight
    if alerts:
        order = {"Critical": 3, "High": 2, "Warning": 1, "Info": 0}
        focus = sorted(alerts, key=lambda a: (order[a.severity], a.confidence), reverse=True)[0]
        server_df = (
            infra_df[infra_df["server_id"] == focus.server_id]
            .sort_values("timestamp")
            .tail(60)
            .copy()
        )
        mm_df = pd.DataFrame(
            {
                "cpu": server_df["cpu_usage"].astype(float).values,
                "memory": server_df["memory_usage"].astype(float).values,
                "errors": server_df["error_count"].astype(float).values,
            }
        )
        mm_pred = predict_multi_metric(mm_df, future_steps=10)
        failure_prob = calculate_failure_probability(mm_pred)

        if failure_prob >= 70:
            current = {
                "server": focus.server_id,
                "cpu": float(mm_df["cpu"].iloc[-1]),
                "memory": float(mm_df["memory"].iloc[-1]),
                "errors": float(mm_df["errors"].iloc[-1]),
            }
            insight = generate_aiops_insight(current, mm_pred, failure_prob)
            print("\n=== Correlated AIOps Insight ===")
            print(insight)


if __name__ == "__main__":
    main()

