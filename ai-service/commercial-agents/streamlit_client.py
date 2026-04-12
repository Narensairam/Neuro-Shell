import json
from typing import Dict, Any

import streamlit as st

from agents import ArbitrageAgent, ChurnAgent, ContractAgent, PricingAgent


@st.cache_resource
def load_agents() -> Dict[str, Any]:
    return {
        "PricingAgent": PricingAgent(),
        "ArbitrageAgent": ArbitrageAgent(),
        "ChurnAgent": ChurnAgent(),
        "ContractAgent": ContractAgent(),
    }


def render_health_checks(agents: Dict[str, Any]) -> None:
    st.header("Agent Health Checks")
    for name, agent in agents.items():
        status = agent.health_check()
        with st.expander(f"{name} - {status['status']}", expanded=False):
            st.json(status)


def show_pricing_agent(agent: PricingAgent) -> None:
    st.header("Pricing Agent")
    st.markdown("Enter commodity and market data, then run the pricing recommendation.")

    default_market_data = {
        "jcc_crude": 85.50,
        "spot_price": 78.25,
        "volatility": 0.28,
        "recent_trend": "up",
        "fundamentals": {
            "supply": "balanced",
            "demand": "strong"
        }
    }

    commodity = st.selectbox("Commodity", ["lng", "oil", "gas", "naphtha"], index=0)
    market_data_input = st.text_area(
        "Market data (JSON)",
        value=json.dumps(default_market_data, indent=2),
        height=180
    )

    if st.button("Run Pricing Recommendation"):
        try:
            market_data = json.loads(market_data_input)
            result = agent.get_price_recommendation(commodity=commodity, market_data=market_data)

            st.subheader("Pricing Summary")
            st.metric("Technical Price", f"${result['technical_price_usd']}")
            st.metric(
                "AI Adjusted Price",
                f"${result['ai_adjusted_price_usd']}",
                delta=f"${result['ai_adjusted_price_usd'] - result['technical_price_usd']:.2f}"
            )
            st.write("**Confidence Interval**")
            st.write(result["confidence_interval"])
            st.write("**Volatility**", result["volatility"])
            st.write("**Requires Approval**", result["requires_approval"])
            st.write("**Reasoning**")
            st.write(result["reasoning"])
            st.write("**Risk Factors**")
            st.write(result["risk_factors"])

            with st.expander("View raw JSON response"):
                st.json(result)
        except json.JSONDecodeError as exc:
            st.error(f"Invalid JSON input: {exc}")


def show_arbitrage_agent(agent: ArbitrageAgent) -> None:
    st.header("Arbitrage Agent")
    st.markdown("Provide commodity prices and detect potential arbitrage opportunities.")

    default_market_prices = {
        "lng": 15.75,
        "gas": 9.60,
        "oil": 82.50,
        "naphtha": 700.00
    }

    market_prices_input = st.text_area(
        "Market prices (JSON)",
        value=json.dumps(default_market_prices, indent=2),
        height=180
    )

    if st.button("Run Arbitrage Detection"):
        try:
            market_prices = json.loads(market_prices_input)
            result = agent.detect_opportunities(market_prices=market_prices)

            st.subheader("Arbitrage Summary")
            st.write("**Opportunities Found:**", result["opportunities_found"])
            if result["best_opportunity"].get("found"):
                st.write("**Best Opportunity:**")
                st.write(result["best_opportunity"])
            else:
                st.info("No strong arbitrage opportunities detected.")

            if result["opportunities"]:
                st.write("**Opportunities Detail**")
                st.table(result["opportunities"])

            st.write("**Market Sentiment:**", result.get("market_sentiment", "neutral"))
            st.write("**AI Recommendations**")
            for recommendation in result.get("ai_recommendations", []):
                st.markdown(f"- {recommendation}")

            with st.expander("View raw JSON response"):
                st.json(result)
        except json.JSONDecodeError as exc:
            st.error(f"Invalid JSON input: {exc}")


def show_churn_agent(agent: ChurnAgent) -> None:
    st.header("Churn Agent")
    st.markdown("Enter customer profile data to predict churn risk and retention recommendations.")

    default_customer_data = {
        "customer_id": "CUST-1001",
        "segment": "B2B_chemicals",
        "region": "EMEA",
        "contract_start": "2021-10-01",
        "contract_value": 1600000,
        "avg_volume": 12500,
        "payment_terms": 45,
        "response_time": 50,
        "complaints": 4,
        "late_payments": 2,
        "volume_trend": -0.06,
        "years_customer": 3.2,
        "last_interaction": 17
    }

    customer_data_input = st.text_area(
        "Customer data (JSON)",
        value=json.dumps(default_customer_data, indent=2),
        height=260
    )

    if st.button("Run Churn Prediction"):
        try:
            customer_data = json.loads(customer_data_input)
            result = agent.predict_churn(customer_data=customer_data)

            st.subheader("Churn Prediction Summary")
            st.metric("Churn Risk Score", result["churn_risk_score"])
            st.write("**Risk Level:**", result["risk_level"])
            st.write("**Priority:**", result["priority"])

            st.write("**Primary Drivers**")
            for driver in result.get("primary_drivers", []):
                st.markdown(f"- {driver}")

            st.write("**Recommended Actions**")
            for action in result.get("recommended_actions", []):
                st.markdown(f"- {action}")

            if result.get("ai_insights"):
                with st.expander("AI Retention Insights"):
                    st.json(result["ai_insights"])

            with st.expander("View raw JSON response"):
                st.json(result)
        except json.JSONDecodeError as exc:
            st.error(f"Invalid JSON input: {exc}")


def show_contract_agent(agent: ContractAgent) -> None:
    st.header("Contract Agent")
    st.markdown("Analyze contract text for risks, negotiation points, and AI insights.")

    default_contract_text = (
        "This LNG sales agreement defines a 10-year supply contract with destination clauses, "
        "price indexation tied to JCC, and a take-or-pay provision for 85% of contracted volumes. "
        "The contract includes force majeure language, nomination windows, and a dispute resolution clause."
    )

    contract_id = st.text_input("Contract ID", value="CTR-2026-001")
    counterparty = st.text_input("Counterparty", value="GlobalEnergy Trading")
    contract_text = st.text_area("Contract text", value=default_contract_text, height=220)

    if st.button("Run Contract Analysis"):
        if not contract_text.strip():
            st.error("Please enter contract text before running analysis.")
            return

        result = agent.analyze_contract(
            contract_text=contract_text,
            contract_id=contract_id,
            counterparty=counterparty
        )

        st.subheader("Contract Analysis Summary")
        st.write("**Overall Risk Score:**", result["overall_risk_score"])
        st.write("**Risk Level:**", result["risk_level"])
        st.write("**Estimated Value at Risk (USD):**", f"${result['estimated_value_at_risk_usd']:,}")
        st.write("**Recommendation:**", result["recommendation"])

        st.write("**Contract Summary**")
        st.write(result.get("contract_summary", "No summary available."))

        st.write("**Key Risks**")
        for risk in result.get("key_risks", []):
            st.markdown(f"- **{risk['clause']}**: {risk['recommendation']} (Score: {risk['risk_score']})")

        st.write("**Negotiation Points**")
        for point in result.get("negotiation_points", []):
            st.markdown(f"- {point}")

        if result.get("compliance_issues"):
            st.write("**Compliance Issues**")
            for issue in result["compliance_issues"]:
                st.markdown(f"- {issue}")

        if result.get("ai_insights"):
            with st.expander("AI Contract Insights"):
                st.json(result["ai_insights"])

        with st.expander("View raw JSON response"):
            st.json(result)


def main() -> None:
    st.set_page_config(page_title="Shell Horizon AI Agents", page_icon="🤖", layout="wide")
    st.title("Shell Horizon AI Agents Demo")
    st.markdown(
        "Use this Streamlit app to interactively test each AI agent and see their outputs in real time. "
        "If `GROQ_API_KEY` is not configured, agents will return mock responses."
    )

    agents = load_agents()

    tab = st.sidebar.selectbox(
        "Select agent",
        ["Health", "Pricing", "Arbitrage", "Churn", "Contract"]
    )

    if tab == "Health":
        render_health_checks(agents)
    elif tab == "Pricing":
        show_pricing_agent(agents["PricingAgent"])
    elif tab == "Arbitrage":
        show_arbitrage_agent(agents["ArbitrageAgent"])
    elif tab == "Churn":
        show_churn_agent(agents["ChurnAgent"])
    elif tab == "Contract":
        show_contract_agent(agents["ContractAgent"])


if __name__ == "__main__":
    main()
