# agent_test_client.py
"""Simple test client for the AI agent layer.

This script instantiates all agents and runs a representative sample request for each.
It prints health checks and the parsed responses so you can verify the integration.
"""

import json
from typing import Dict

from agents import ArbitrageAgent, ChurnAgent, ContractAgent, PricingAgent


class AgentTestClient:
    def __init__(self):
        self.pricing_agent = PricingAgent()
        self.arbitrage_agent = ArbitrageAgent()
        self.churn_agent = ChurnAgent()
        self.contract_agent = ContractAgent()

    def _print_section(self, title: str):
        print("\n" + "=" * 80)
        print(title)
        print("=" * 80)

    def _print_json(self, data: Dict):
        print(json.dumps(data, indent=2, sort_keys=False))

    def run_health_checks(self):
        self._print_section("AGENT HEALTH CHECKS")
        for name, agent in [
            ("PricingAgent", self.pricing_agent),
            ("ArbitrageAgent", self.arbitrage_agent),
            ("ChurnAgent", self.churn_agent),
            ("ContractAgent", self.contract_agent),
        ]:
            status = agent.health_check()
            print(f"{name}: {status['status']} (model={status['model']})")
            self._print_json(status)

    def run_pricing_test(self):
        self._print_section("PRICING AGENT TEST")
        sample_market_data = {
            "jcc_crude": 85.50,
            "spot_price": 78.25,
            "volatility": 0.28,
            "recent_trend": "up",
            "fundamentals": {
                "supply": "balanced",
                "demand": "strong"
            }
        }
        result = self.pricing_agent.get_price_recommendation(
            commodity="lng", market_data=sample_market_data
        )
        self._print_json(result)

    def run_arbitrage_test(self):
        self._print_section("ARBITRAGE AGENT TEST")
        sample_market_prices = {
            "lng": 15.75,
            "gas": 9.60,
            "oil": 82.50,
            "naphtha": 700.00
        }
        result = self.arbitrage_agent.detect_opportunities(
            market_prices=sample_market_prices
        )
        self._print_json(result)

    def run_churn_test(self):
        self._print_section("CHURN AGENT TEST")
        sample_customer_data = {
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
        result = self.churn_agent.predict_churn(customer_data=sample_customer_data)
        self._print_json(result)

    def run_contract_test(self):
        self._print_section("CONTRACT AGENT TEST")
        sample_contract_text = (
            "This LNG sales agreement defines a 10-year supply contract with destination clauses, "
            "price indexation tied to JCC, and a take-or-pay provision for 85% of contracted volumes. "
            "The contract includes force majeure language, nomination windows, and a dispute resolution clause."
        )
        result = self.contract_agent.analyze_contract(
            contract_text=sample_contract_text,
            contract_id="CTR-2026-001",
            counterparty="GlobalEnergy Trading"
        )
        self._print_json(result)

    def run_all(self):
        self.run_health_checks()
        self.run_pricing_test()
        self.run_arbitrage_test()
        self.run_churn_test()
        self.run_contract_test()


if __name__ == "__main__":
    AgentTestClient().run_all()
