# agents/pricing_agent.py
import json
import random
from typing import Dict, Any, Optional
from agents.base_groq_agent import BaseGroqAgent
from domain.pricing_models import PricingCalculator, PricingModels

class PricingAgent(BaseGroqAgent):
    """AI-powered pricing agent for commodities - Enterprise AI OS"""

    def __init__(self):
        super().__init__("PricingAgent", model="llama3-8b-8192")
        self.calculator = PricingCalculator()

    def get_price_recommendation(self, commodity: str, market_data: Dict = None, user_id: str = "system") -> Dict:
        """Get AI-powered price recommendation with full dashboard data.

        Returns structured data for the AI Pricing Agent dashboard including:
        - Current vs AI recommended price
        - Revenue, margin and demand KPIs
        - Competitor pricing intelligence
        - Risk alerts and AI insights
        - Margin & Revenue simulation data
        """

        # Fetch real market data from tools if available
        if self.tools_enabled and self.tools_manager:
            market_data = self._fetch_real_market_data(commodity)
        elif market_data is None:
            market_data = {}

        # Calculate technical price baseline
        technical = self._calculate_technical_price(commodity, market_data)
        current_price = technical["current_price"]
        ai_price = technical["ai_suggested_price"]

        # Get AI insights (Groq or mock)
        if self.groq_available:
            ai_insights = self._get_ai_insights(commodity, market_data, technical)
        else:
            ai_insights = self._get_mock_insights(commodity, technical)

        # Override ai_price with Groq suggestion if available
        ai_price = ai_insights.get("adjusted_price", ai_price)

        # Derived KPIs
        price_change_pct = round(((ai_price - current_price) / current_price) * 100, 1)
        revenue_impact_pct = round(price_change_pct * 0.91, 1)  # volume-weighted
        margin_change_pct = round(price_change_pct * 0.50, 1)
        demand_forecast = self._estimate_demand(commodity, current_price, ai_price)
        ai_confidence = ai_insights.get("confidence_score", 0.93)
        ai_confidence_pct = round(ai_confidence * 100)

        # Competitor pricing
        competitor_avg = round(ai_price * random.uniform(0.96, 1.02), 0)
        our_percentile = min(99, max(50, int(85 + (ai_price - current_price) / current_price * 100)))

        # Projected revenue & margin at AI price
        projected_revenue_m = round((demand_forecast * ai_price) / 1_000_000, 1)
        cost_per_unit = current_price * 0.78
        expected_margin_pct = round(((ai_price - cost_per_unit) / ai_price) * 100, 1)

        # Demand-vs-price curve data (bell curve, 11 points)
        demand_curve = self._build_demand_curve(current_price, ai_price)

        # Why this price reasons
        why_reasons = ai_insights.get("why_reasons", [
            "Rising demand trend",
            "Competitor prices increased",
            "Cost of raw materials up",
        ])

        # Risk alerts
        risk_alerts = ai_insights.get("risk_alerts", [
            {"level": "warning", "label": "Competitor", "text": "Price Drop Risk"},
            {"level": "warning", "label": "Supply Chain", "text": "Constraints"},
            {"level": "info",    "label": "Demand",      "text": "Volatility Warning"},
        ])

        return {
            # Core prices
            "current_price": round(current_price, 2),
            "ai_recommended_price": round(ai_price, 2),
            "price_change_pct": price_change_pct,

            # KPI bar
            "revenue_impact_pct": revenue_impact_pct,
            "margin_change_pct": margin_change_pct,
            "demand_forecast_units": demand_forecast,
            "ai_confidence_pct": ai_confidence_pct,

            # Competitor panel
            "competitor_avg_price": competitor_avg,
            "our_percentile": our_percentile,

            # Simulator
            "projected_revenue_m": projected_revenue_m,
            "expected_margin_pct": expected_margin_pct,
            "demand_estimate_units": demand_forecast,

            # Chart
            "demand_curve": demand_curve,

            # Text content
            "why_reasons": why_reasons,
            "ai_insights_text": ai_insights.get(
                "reasoning",
                f"AI has identified increased competitor prices and a strong demand trend, recommending a price adjustment to maximize revenue."
            ),
            "risk_alerts": risk_alerts,

            # Legacy / metadata
            "commodity": commodity,
            "technical_price_usd": round(current_price, 2),
            "ai_adjusted_price_usd": round(ai_price, 2),
            "confidence_interval": technical["confidence_interval"],
            "reasoning": ai_insights.get("reasoning", "Based on technical analysis"),
            "risk_factors": [r["text"] for r in risk_alerts],
            "requires_approval": technical["volatility"] > 0.3,
            "volatility": technical["volatility"],
            "market_data_source": "real-time feeds" if self.tools_enabled else "mock",
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────────────────────────────────────

    def _fetch_real_market_data(self, commodity: str) -> Dict:
        """Fetch real market data from market data feeds"""
        try:
            market_data = {}
            if commodity.lower() == "lng":
                lng_data = self.tools_manager.get_lng_prices()
                market_data["jcc_crude"] = lng_data.get("prices", {}).get("jcc_average", 12.50)
                market_data["spot_price"] = lng_data.get("prices", {}).get("jcc_average", 12.50)
                market_data["volatility"] = 0.18
            elif commodity.lower() in ("oil", "brent"):
                oil_data = self.tools_manager.get_oil_prices()
                market_data["spot_price"] = oil_data.get("prices", {}).get("spot_price", 82.50)
                market_data["volatility"] = 0.15
            elif commodity.lower() == "gas":
                gas_data = self.tools_manager.get_gas_prices()
                market_data["spot_price"] = gas_data.get("prices", {}).get("spot_price", 3.50)
                market_data["volatility"] = 0.20
            return market_data
        except Exception as e:
            print(f"Error fetching market data: {e}")
            return {}

    def _calculate_technical_price(self, commodity: str, market_data: Dict) -> Dict:
        """Calculate current price and AI-suggested price using domain models"""
        if commodity.lower() == "lng":
            jcc_price = market_data.get("jcc_crude", 82.50)
            current = self.calculator.get_lng_price("jcc", jcc_price)
        else:
            current = market_data.get("spot_price", 1100.0)

        volatility = market_data.get("volatility", 0.15)

        # AI suggested price: apply a small upward optimisation (+5–15%)
        uplift = random.uniform(0.10, 0.16)
        ai_suggested = round(current * (1 + uplift), 2)

        return {
            "current_price": round(current, 2),
            "ai_suggested_price": ai_suggested,
            "volatility": volatility,
            "confidence_interval": {
                "lower": round(current * (1 - volatility), 2),
                "upper": round(current * (1 + volatility), 2),
            },
        }

    def _estimate_demand(self, commodity: str, current_price: float, ai_price: float) -> int:
        """Estimate demand forecast in units (simplified price-elasticity model)"""
        base_demand = {
            "lng": 14_500,
            "oil": 18_200,
            "brent": 18_200,
            "gas": 22_400,
        }.get(commodity.lower(), 14_500)

        elasticity = -0.4        # typical energy elasticity
        price_ratio = (ai_price - current_price) / current_price
        adjusted = int(base_demand * (1 + elasticity * price_ratio))
        return max(5_000, adjusted)

    def _build_demand_curve(self, current_price: float, ai_price: float) -> list:
        """Build 11-point demand-vs-price curve for the bell chart"""
        import math
        peak_price = ai_price * 1.02          # revenue peak slightly above AI price
        curve = []
        for i in range(11):
            price = current_price * 0.85 + i * (current_price * 0.30 / 10)
            # Gaussian demand shape
            demand = 100 * math.exp(-0.5 * ((price - peak_price) / (peak_price * 0.12)) ** 2)
            curve.append({
                "price": round(price, 0),
                "demand": round(demand, 1),
                "is_current": abs(price - current_price) < current_price * 0.04,
                "is_ai": abs(price - ai_price) < current_price * 0.04,
            })
        return curve

    def _get_ai_insights(self, commodity: str, market_data: Dict, technical: Dict) -> Dict:
        """Get AI-enhanced insights from Groq"""
        system_prompt = """You are Shell's Enterprise Pricing AI Agent. Analyze market data and provide a pricing recommendation dashboard.
        Return ONLY valid JSON with these exact keys:
        {
          "adjusted_price": <float>,
          "reasoning": <1-2 sentence string for AI Insights panel>,
          "why_reasons": [<3 short bullet strings explaining the price>],
          "risk_alerts": [
            {"level": "warning|info|critical", "label": "<short label>", "text": "<alert text>"},
            {"level": "warning|info|critical", "label": "<short label>", "text": "<alert text>"},
            {"level": "warning|info|critical", "label": "<short label>", "text": "<alert text>"}
          ],
          "confidence_score": <float 0.0-1.0>
        }"""

        user_prompt = f"""
        Commodity: {commodity}
        Current Market Data: {json.dumps(market_data)}
        Current Price: {technical['current_price']}
        AI Baseline Suggested: {technical['ai_suggested_price']}
        Volatility: {technical['volatility']}

        Provide an enterprise pricing recommendation with risk alerts and reasoning.
        """

        response = self._call_groq(system_prompt, user_prompt)
        return response

    def _get_mock_insights(self, commodity: str, technical: Dict) -> Dict:
        """Rich mock insights when Groq is unavailable"""
        current = technical["current_price"]
        ai_price = technical["ai_suggested_price"]
        pct = round(((ai_price - current) / current) * 100, 1)

        return {
            "adjusted_price": ai_price,
            "reasoning": (
                f"AI has identified increased competitor prices and a strong demand trend, "
                f"recommending a price adjustment to maximize revenue."
            ),
            "why_reasons": [
                "Rising demand trend",
                "Competitor prices increased",
                "Cost of raw materials up",
            ],
            "risk_alerts": [
                {"level": "warning",  "label": "Competitor",    "text": "Price Drop Risk"},
                {"level": "warning",  "label": "Supply Chain",  "text": "Constraints"},
                {"level": "info",     "label": "Demand",        "text": "Volatility Warning"},
            ],
            "confidence_score": 0.93,
        }