# agents/__init__.py
"""
Shell Horizon - AI Agents Layer
Groq-powered AI agents for all 6 domains with integrated tools

All agents now support:
- Real-time data from enterprise systems (ETRM, SAP, Salesforce, PI, Market Data)
- Semantic search via vector stores
- Graceful degradation to mock data when systems unavailable
"""

from agents.base_groq_agent import BaseGroqAgent
from agents.pricing_agent import PricingAgent
from agents.contract_agent import ContractAgent
from agents.arbitrage_agent import ArbitrageAgent
from agents.churn_agent import ChurnAgent

__all__ = [
    "BaseGroqAgent",
    "PricingAgent",
    "ContractAgent",
    "ArbitrageAgent",
    "ChurnAgent",
]

__version__ = "1.1.0"
__description__ = "AI Agents with integrated tools support"

from .base_groq_agent import BaseGroqAgent
from .pricing_agent import PricingAgent
from .arbitrage_agent import ArbitrageAgent
from .churn_agent import ChurnAgent
from .contract_agent import ContractAgent

__all__ = [
    'BaseGroqAgent',
    'PricingAgent',
    'ArbitrageAgent',
    'ChurnAgent',
    'ContractAgent'
]