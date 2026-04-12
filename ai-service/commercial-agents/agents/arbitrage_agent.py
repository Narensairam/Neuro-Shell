# agents/arbitrage_agent.py
import json
from typing import Dict, List, Any
from agents.base_groq_agent import BaseGroqAgent
from domain.arbitrage_math import ArbitrageCalculator, ArbitrageOpportunity

class ArbitrageAgent(BaseGroqAgent):
    """AI-powered arbitrage detection agent"""
    
    def __init__(self):
        super().__init__("ArbitrageAgent", model="llama3-8b-8192")
        self.calculator = ArbitrageCalculator()
    
    def detect_opportunities(self, market_prices: Dict[str, float] = None, user_id: str = "system") -> Dict:
        """Detect arbitrage opportunities across commodities
        
        Fetches real market data from feeds if not provided.
        """
        
        # Fetch real market prices if available
        if self.tools_enabled and self.tools_manager and not market_prices:
            market_prices = self._fetch_real_market_prices()
        elif market_prices is None:
            market_prices = {}
        
        # Detect using mathematical models
        technical_opps = self.calculator.detect_arbitrage_opportunities(market_prices)
        
        # Enhance with AI
        if self.groq_available and technical_opps:
            ai_analysis = self._get_ai_arbitrage_analysis(market_prices, technical_opps)
        else:
            ai_analysis = self._get_mock_arbitrage_analysis(technical_opps)
        
        return {
            "opportunities_found": len(technical_opps),
            "opportunities": [
                {
                    "type": opp.opportunity_type.value,
                    "buy": opp.buy_asset,
                    "sell": opp.sell_asset,
                    "estimated_pnl": opp.estimated_pnl_per_unit,
                    "risk_score": opp.risk_score,
                    "requires_approval": opp.requires_approval
                }
                for opp in technical_opps
            ],
            "ai_recommendations": ai_analysis.get("recommendations", []),
            "best_opportunity": self._get_best_opportunity(technical_opps),
            "market_sentiment": ai_analysis.get("sentiment", "neutral"),
            "data_sources": ["real-time market feeds"] if self.tools_enabled else ["mock"]
        }
    
    def _fetch_real_market_prices(self) -> Dict[str, float]:
        """Fetch real market prices from market data feeds"""
        try:
            prices = {}
            
            # Get LNG prices
            lng_data = self.tools_manager.get_lng_prices()
            prices["lng_jcc"] = lng_data.get("prices", {}).get("jcc_average", 12.50)
            
            # Get oil prices
            oil_data = self.tools_manager.get_oil_prices()
            prices["brent_crude"] = oil_data.get("prices", {}).get("spot_price", 82.50)
            
            # Get natural gas prices
            gas_data = self.tools_manager.get_gas_prices()
            prices["henry_hub"] = gas_data.get("prices", {}).get("spot_price", 3.50)
            
            # Get futures
            lng_futures = self.tools_manager.get_futures_prices("LNG", months=1)
            if lng_futures:
                prices["lng_futures_1m"] = lng_futures[0].get("close", 12.50)
            
            return prices
        except Exception as e:
            print(f"Error fetching market prices: {e}")
            return {}
    
    def _get_best_opportunity(self, opportunities: List[ArbitrageOpportunity]) -> Dict:
        """Find the best opportunity based on PnL and risk"""
        if not opportunities:
            return {"found": False}
        
        best = max(opportunities, key=lambda x: x.estimated_pnl_per_unit / (x.risk_score + 1))
        return {
            "found": True,
            "type": best.opportunity_type.value,
            "estimated_pnl": best.estimated_pnl_per_unit,
            "risk_score": best.risk_score
        }
    
    def _get_ai_arbitrage_analysis(self, market_prices: Dict, opportunities: List) -> Dict:
        """Get AI analysis of arbitrage opportunities"""
        
        system_prompt = """You are Shell's Arbitrage Trading AI. Analyze market conditions and recommend trades.
        Return JSON with: recommendations (list of strings), sentiment (bullish/bearish/neutral), risk_assessment."""
        
        user_prompt = f"""
        Market Prices: {json.dumps(market_prices)}
        Opportunities Found: {len(opportunities)}
        
        Provide arbitrage trading recommendations.
        """
        
        return self._call_groq(system_prompt, user_prompt)
    
    def _get_mock_arbitrage_analysis(self, opportunities: List) -> Dict:
        """Mock analysis when Groq unavailable"""
        if opportunities:
            return {
                "recommendations": ["Execute crack spread arbitrage", "Monitor LNG-Gas spread"],
                "sentiment": "bullish",
                "risk_assessment": "moderate"
            }
        return {
            "recommendations": ["Wait for better opportunities"],
            "sentiment": "neutral",
            "risk_assessment": "low"
        }