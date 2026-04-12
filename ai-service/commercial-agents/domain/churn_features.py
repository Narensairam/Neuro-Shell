# domain/churn_features.py
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class CustomerProfile:
    customer_id: str
    segment: str
    region: str
    contract_start_date: datetime
    contract_value_usd: float
    average_monthly_volume: float
    payment_terms_days: int
    avg_response_time_hours: float
    complaint_count_6m: int
    late_payment_count: int
    volume_trend_3m: float
    years_as_customer: float
    last_interaction_days: int
    competitor_pressure: int = 1
    loyalty_index: float = 0.5

class ChurnFeatureEngineer:
    
    def __init__(self):
        self.feature_weights = {
            "contract_value_decay": 0.15,
            "complaint_frequency": 0.25,
            "volume_trend": 0.20,
            "payment_behavior": 0.15,
            "interaction_recency": 0.10,
            "competitor_presence": 0.15
        }
    
    def calculate_churn_risk(self, customer: CustomerProfile, market_conditions: Optional[Dict] = None) -> Dict:
        risk_components = {}

        if customer.volume_trend_3m < -0.10:
            volume_risk = 80
        elif customer.volume_trend_3m < 0:
            volume_risk = 45
        else:
            volume_risk = 15
        risk_components["volume_trend"] = volume_risk * self.feature_weights["volume_trend"]

        complaint_risk = min(100, customer.complaint_count_6m * 18)
        risk_components["complaints"] = complaint_risk * self.feature_weights["complaint_frequency"]

        payment_risk = min(100, customer.late_payment_count * 20)
        risk_components["payment"] = payment_risk * self.feature_weights["payment_behavior"]

        recency_risk = min(100, customer.last_interaction_days * 1.8)
        risk_components["recency"] = recency_risk * self.feature_weights["interaction_recency"]

        competitor_risk = min(100, customer.competitor_pressure * 25)
        risk_components["competitor_pressure"] = competitor_risk * self.feature_weights["competitor_presence"]

        contract_age_years = max(0, (datetime.now() - customer.contract_start_date).days / 365)
        contract_age_risk = 10 if contract_age_years < 1 else 5 if contract_age_years < 3 else 1
        risk_components["contract_age"] = contract_age_risk * self.feature_weights["contract_value_decay"]

        total_risk = sum(risk_components.values())

        segment_multipliers = {
            "B2B_chemicals": 1.25,
            "B2B_lubricants": 1.05,
            "retail_fuel": 0.85,
            "aviation": 1.15,
            "marine": 1.30
        }

        multiplier = segment_multipliers.get(customer.segment, 1.0)
        adjusted_risk = min(100, total_risk * multiplier)

        return {
            "churn_risk_score": round(adjusted_risk, 1),
            "risk_components": {k: round(v, 2) for k, v in risk_components.items()},
            "risk_level": self._get_risk_level(adjusted_risk),
            "primary_drivers": self._identify_drivers(risk_components),
            "customer_health_score": max(0, round(100 - adjusted_risk, 1))
        }

    def _get_risk_level(self, score: float) -> str:
        if score >= 70:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 30:
            return "medium"
        else:
            return "low"

    def _identify_drivers(self, risk_components: Dict[str, float]) -> List[str]:
        sorted_components = sorted(risk_components.items(), key=lambda x: x[1], reverse=True)
        return [comp for comp, score in sorted_components[:3] if score > 15]

    def recommend_retention_actions(self, customer: CustomerProfile, churn_risk: Dict) -> List[Dict]:
        actions = []
        drivers = churn_risk["primary_drivers"]

        if "complaints" in drivers:
            actions.append({
                "action": "schedule_customer_success_review",
                "priority": "high",
                "expected_impact": "-20% churn",
                "cost_usd": 500,
                "timeline_days": 3
            })

        if "volume_trend" in drivers:
            actions.append({
                "action": "offer_volume_commitment_incentive",
                "priority": "high",
                "expected_impact": "-25% churn",
                "cost_usd": round(customer.contract_value_usd * 0.04, 2),
                "timeline_days": 5
            })

        if "payment" in drivers:
            actions.append({
                "action": "review_payment_terms_and_credit_support",
                "priority": "medium",
                "expected_impact": "-15% churn",
                "cost_usd": 250,
                "timeline_days": 7
            })

        if "competitor_pressure" in drivers:
            actions.append({
                "action": "deploy_cross-sell_carbon_credit_bundle",
                "priority": "medium",
                "expected_impact": "-18% churn",
                "cost_usd": 400,
                "timeline_days": 10
            })

        if not actions:
            actions.append({
                "action": "send_customer_satisfaction_survey",
                "priority": "low",
                "expected_impact": "-5% churn",
                "cost_usd": 100,
                "timeline_days": 2
            })

        if customer.loyalty_index < 0.4:
            actions.append({
                "action": "assign_key_account_manager",
                "priority": "high",
                "expected_impact": "-12% churn",
                "cost_usd": 1200,
                "timeline_days": 14
            })

        return actions

class Customer360:
    def __init__(self):
        self.feature_engineer = ChurnFeatureEngineer()