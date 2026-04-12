# agents/churn_agent.py
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from agents.base_groq_agent import BaseGroqAgent
from domain.churn_features import ChurnFeatureEngineer, CustomerProfile

class ChurnAgent(BaseGroqAgent):
    """AI-powered customer churn prediction agent"""
    
    def __init__(self):
        super().__init__("ChurnAgent", model="llama3-8b-8192")
        self.engine = ChurnFeatureEngineer()
    
    def predict_churn(self, customer_data: Dict = None, customer_id: str = None, user_id: str = "system") -> Dict:
        """Predict customer churn risk
        
        Can fetch customer data from Salesforce and ETRM if not provided.
        """
        
        # If customer_data not provided, try to fetch from Salesforce
        if not customer_data and customer_id and self.tools_enabled and self.tools_manager:
            customer_data = self._fetch_customer_data(customer_id)
        
        if not customer_data:
            customer_data = {}
        
        # Create customer profile
        customer = self._create_customer_profile(customer_data)
        
        # Calculate churn risk using domain models
        risk_analysis = self.engine.calculate_churn_risk(customer)
        
        # Get retention recommendations
        retention_actions = self.engine.recommend_retention_actions(customer, risk_analysis)
        
        # Get sales opportunities and engagement data
        opportunities_data = []
        if self.tools_enabled and self.tools_manager:
            opportunities_data = self._get_customer_opportunities(customer_id or customer_data.get("customer_id"))
        
        # Enhance with AI if available
        if self.groq_available:
            ai_insights = self._get_ai_churn_insights(customer_data, risk_analysis)
        else:
            ai_insights = self._get_mock_churn_insights()
        
        return {
            "customer_id": customer_data.get("customer_id", "unknown"),
            "churn_risk_score": risk_analysis["churn_risk_score"],
            "risk_level": risk_analysis["risk_level"],
            "primary_drivers": risk_analysis["primary_drivers"],
            "recommended_actions": retention_actions,
            "ai_insights": ai_insights,
            "priority": self._get_priority(risk_analysis["churn_risk_score"]),
            "sales_opportunities": opportunities_data,
            "data_sources": ["salesforce", "etrm", "domain_analysis"] if self.tools_enabled else ["domain_analysis"]
        }
    
    def _fetch_customer_data(self, customer_id: str) -> Dict:
        """Fetch customer data from Salesforce"""
        try:
            # Get accounts from Salesforce
            accounts = self.tools_manager.get_accounts()
            
            # Find matching account
            for account in accounts:
                if account.get("id") == customer_id or account.get("name") == customer_id:
                    return {
                        "customer_id": account.get("id"),
                        "customer_name": account.get("name"),
                        "segment": "B2B_Energy" if account.get("industry") == "Energy" else "B2B",
                        "region": account.get("billing_country", "EMEA"),
                        "contract_value": account.get("annual_revenue", 0),
                        "contract_start": "2020-01-01"
                    }
            
            return {}
        except Exception as e:
            print(f"Error fetching customer data: {e}")
            return {}
    
    def _get_customer_opportunities(self, customer_id: str) -> List[Dict]:
        """Get sales opportunities for customer"""
        try:
            opportunities = self.tools_manager.get_opportunities()
            
            # Filter for this customer
            customer_opps = [
                {
                    "opportunity": opp.get("name"),
                    "stage": opp.get("stage"),
                    "amount": opp.get("amount"),
                    "probability": opp.get("probability", 0)
                }
                for opp in opportunities
                if opp.get("account_id") == customer_id or not customer_id
            ]
            
            return customer_opps[:3]
        except Exception as e:
            print(f"Error getting opportunities: {e}")
            return []
    
    def _create_customer_profile(self, data: Dict) -> CustomerProfile:
        """Create CustomerProfile from dictionary"""
        return CustomerProfile(
            customer_id=data.get("customer_id", "unknown"),
            segment=data.get("segment", "B2B_chemicals"),
            region=data.get("region", "EMEA"),
            contract_start_date=datetime.strptime(data.get("contract_start", "2020-01-01"), "%Y-%m-%d"),
            contract_value_usd=float(data.get("contract_value", 0)),
            average_monthly_volume=float(data.get("avg_volume", 0)),
            payment_terms_days=int(data.get("payment_terms", 30)),
            avg_response_time_hours=float(data.get("response_time", 48)),
            complaint_count_6m=int(data.get("complaints", 0)),
            late_payment_count=int(data.get("late_payments", 0)),
            volume_trend_3m=float(data.get("volume_trend", 0)),
            years_as_customer=float(data.get("years_customer", 0)),
            last_interaction_days=int(data.get("last_interaction", 30))
        )
    
    def _get_priority(self, risk_score: float) -> str:
        if risk_score >= 70:
            return "critical"
        elif risk_score >= 50:
            return "high"
        elif risk_score >= 30:
            return "medium"
        else:
            return "low"
    
    def _get_ai_churn_insights(self, customer_data: Dict, risk_analysis: Dict) -> Dict:
        """Get AI insights about churn"""
        
        system_prompt = """You are Shell's Customer Retention AI. Analyze customer data and provide retention strategies.
        Return JSON with: retention_strategy (string), expected_impact (string), warning_signs (list of strings)."""
        
        user_prompt = f"""
        Customer Data: {json.dumps(customer_data)}
        Risk Score: {risk_analysis['churn_risk_score']}
        Risk Level: {risk_analysis['risk_level']}
        
        Provide retention recommendations.
        """
        
        return self._call_groq(system_prompt, user_prompt)
    
    def _get_mock_churn_insights(self) -> Dict:
        """Mock insights when Groq unavailable"""
        return {
            "retention_strategy": "Schedule customer success call and offer volume discount",
            "expected_impact": "High - 80% retention probability",
            "warning_signs": ["Increased complaints", "Reduced engagement"]
        }