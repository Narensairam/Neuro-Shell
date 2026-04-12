# agents/pricing_agent.py
import json
from typing import Dict, Any, Optional
from agents.base_groq_agent import BaseGroqAgent
from domain.pricing_models import PricingCalculator

class PricingAgent(BaseGroqAgent):
    """AI-powered pricing agent for commodities"""
    
    def __init__(self):
        super().__init__("PricingAgent", model="llama3-8b-8192")
        self.calculator = PricingCalculator()
    
    def get_price_recommendation(self, commodity: str, market_data: Dict = None, user_id: str = "system") -> Dict:
        """Get AI-powered price recommendation
        
        Fetches real market data from market data feeds if not provided.
        """
        
        # Fetch real market data from tools if available
        if self.tools_enabled and self.tools_manager:
            market_data = self._fetch_real_market_data(commodity)
        elif market_data is None:
            market_data = {}
        
        # Calculate technical price
        technical_price = self._calculate_technical_price(commodity, market_data)
        
        # Enhance with AI if available
        if self.groq_available:
            ai_insights = self._get_ai_insights(commodity, market_data, technical_price)
        else:
            ai_insights = self._get_mock_insights(commodity, technical_price)
        
        return {
            "commodity": commodity,
            "technical_price_usd": technical_price["price"],
            "ai_adjusted_price_usd": ai_insights.get("adjusted_price", technical_price["price"]),
            "confidence_interval": technical_price["confidence_interval"],
            "reasoning": ai_insights.get("reasoning", "Based on technical analysis"),
            "risk_factors": ai_insights.get("risk_factors", ["Market volatility"]),
            "requires_approval": technical_price["volatility"] > 0.3,
            "volatility": technical_price["volatility"],
            "market_data_source": "real-time feeds" if self.tools_enabled else "mock",
            "timestamp": "2024-01-01T00:00:00"
        }
    
    def _fetch_real_market_data(self, commodity: str) -> Dict:
        """Fetch real market data from market data feeds"""
        try:
            market_data = {}
            
            if commodity.lower() == "lng":
                lng_data = self.tools_manager.get_lng_prices()
                market_data["jcc_crude"] = lng_data.get("prices", {}).get("jcc_average", 12.50)
                market_data["spot_price"] = lng_data.get("prices", {}).get("jcc_average", 12.50)
                market_data["volatility"] = 0.18
                
            elif commodity.lower() == "oil" or commodity.lower() == "brent":
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
        """Calculate price using domain models"""
        
        if commodity.lower() == "lng":
            jcc_price = market_data.get("jcc_crude", 82.50)
            price = self.calculator.get_lng_price("jcc", jcc_price)
        else:
            price = market_data.get("spot_price", 75.00)
        
        volatility = market_data.get("volatility", 0.25)
        
        return {
            "price": round(price, 2),
            "volatility": volatility,
            "confidence_interval": {
                "lower": round(price * (1 - volatility), 2),
                "upper": round(price * (1 + volatility), 2)
            }
        }
    
    def _get_ai_insights(self, commodity: str, market_data: Dict, technical: Dict) -> Dict:
        """Get AI-enhanced insights from Groq"""
        
        system_prompt = """You are Shell's Pricing AI Agent. Analyze market data and provide pricing recommendations.
        Return JSON with: adjusted_price, reasoning, risk_factors (list of 3), confidence_score."""
        
        user_prompt = f"""
        Commodity: {commodity}
        Market Data: {json.dumps(market_data)}
        Technical Price: ${technical['price']}
        Volatility: {technical['volatility']}
        
        Provide AI-enhanced pricing recommendation.
        """
        
        response = self._call_groq(system_prompt, user_prompt)
        return response
    
    def _get_mock_insights(self, commodity: str, technical: Dict) -> Dict:
        """Mock insights when Groq unavailable"""
        return {
            "adjusted_price": technical["price"],
            "reasoning": f"Technical analysis suggests ${technical['price']} is optimal for {commodity}",
            "risk_factors": ["Supply chain disruptions", "Geopolitical tensions", "Weather patterns"],
            "confidence_score": 0.85
        }