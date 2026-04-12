# tools/tools_manager.py
"""Tools Manager - Central hub for all agent-callable tools

Provides unified interface for agents to access:
- External data systems
- Market data
- Document search
- Analytics capabilities
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime

from tools.etrm_client import ETRMClient
from tools.sap_client import SAPClient
from tools.salesforce_client import SalesforceClient
from tools.pi_historian import PIHistorian
from tools.market_data import MarketDataClient
from tools.vector_store import VectorStore


class ToolsManager:
    """Centralized manager for all external tools"""
    
    def __init__(self):
        """Initialize all tool clients"""
        self.etrm = ETRMClient()
        self.sap = SAPClient()
        self.salesforce = SalesforceClient()
        self.pi_historian = PIHistorian()
        self.market_data = MarketDataClient()
        self.vector_store = VectorStore()
        
        self.tools_available = {
            "etrm": self.etrm,
            "sap": self.sap,
            "salesforce": self.salesforce,
            "pi_historian": self.pi_historian,
            "market_data": self.market_data,
            "vector_store": self.vector_store
        }
    
    def get_tool(self, tool_name: str):
        """Get a specific tool by name"""
        return self.tools_available.get(tool_name)
    
    def get_deals(self, entity: str = "Shell", 
                  commodity: str = None) -> List[Dict]:
        """Get trading deals from ETRM"""
        return self.etrm.get_deals(entity=entity, commodity=commodity)
    
    def get_positions(self, entity: str = "Shell") -> Dict:
        """Get current trading positions"""
        return self.etrm.get_positions(entity=entity)
    
    def get_materials(self, search_term: str = None) -> List[Dict]:
        """Search SAP materials"""
        return self.sap.get_materials(search_term=search_term)
    
    def get_purchase_orders(self, vendor: str = None) -> List[Dict]:
        """Get purchase orders from SAP"""
        return self.sap.get_purchase_orders(vendor=vendor)
    
    def get_accounts(self, industry: str = None) -> List[Dict]:
        """Search Salesforce accounts"""
        return self.salesforce.get_accounts(industry=industry)
    
    def get_opportunities(self, stage: str = None) -> List[Dict]:
        """Get sales opportunities"""
        return self.salesforce.get_opportunities(stage=stage)
    
    def get_sensor_data(self, tag_name: str, 
                       hours_back: int = 24) -> Dict:
        """Get historical sensor/SCADA data from PI"""
        return self.pi_historian.get_tag_data(
            tag_name, 
            start_time=(datetime.now() - timedelta(hours=hours_back)).isoformat()
        )
    
    def get_real_time_sensors(self, tag_name: str) -> Dict:
        """Get current real-time sensor values"""
        return self.pi_historian.get_real_time_value(tag_name)
    
    def get_lng_prices(self, market: str = "JCC") -> Dict:
        """Get current LNG prices"""
        return self.market_data.get_lng_prices(market=market)
    
    def get_oil_prices(self, crude: str = "Brent") -> Dict:
        """Get current oil prices"""
        return self.market_data.get_oil_prices(crude_type=crude)
    
    def get_gas_prices(self, market: str = "Henry_Hub") -> Dict:
        """Get natural gas prices"""
        return self.market_data.get_natural_gas_prices(market=market)
    
    def get_futures_prices(self, commodity: str, months: int = 3) -> List[Dict]:
        """Get futures contract prices"""
        return self.market_data.get_futures_prices(commodity=commodity, contract_months=months)
    
    def search_contracts(self, query: str, top_k: int = 5) -> List[Dict]:
        """Semantic search for similar contracts"""
        return self.vector_store.search_contracts(query, top_k=top_k)
    
    def index_contract(self, contract_id: str, text: str, metadata: Dict = None) -> Dict:
        """Index a contract for semantic search"""
        return self.vector_store.index_contract(contract_id, text, metadata)
    
    def find_similar_clauses(self, clause_text: str, 
                            clause_type: str = None) -> List[Dict]:
        """Find similar contract clauses"""
        return self.vector_store.find_similar_clauses(clause_text, clause_type)
    
    def health_check(self) -> Dict[str, Any]:
        """Check health of all connected systems"""
        health = {
            "timestamp": datetime.now().isoformat(),
            "systems": {}
        }
        
        for name, tool in self.tools_available.items():
            try:
                health["systems"][name] = tool.health_check()
            except:
                health["systems"][name] = {
                    "status": "error",
                    "service": name
                }
        
        return health
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of available tools and their status"""
        return {
            "timestamp": datetime.now().isoformat(),
            "available_tools": list(self.tools_available.keys()),
            "tool_count": len(self.tools_available),
            "description": "Centralized access to all agent-callable tools"
        }


from datetime import timedelta
