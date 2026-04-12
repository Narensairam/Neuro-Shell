# agents/contract_agent.py
import json
from typing import Dict, Any, List
from agents.base_groq_agent import BaseGroqAgent
from domain.contract_parser import ContractParser

class ContractAgent(BaseGroqAgent):
    """AI-powered LNG contract analysis agent"""
    
    def __init__(self):
        super().__init__("ContractAgent", model="llama3-70b-8192")  # Using 70B for complex analysis
        self.parser = ContractParser()
    
    def analyze_contract(self, contract_text: str, contract_id: str, counterparty: str, user_id: str = "system") -> Dict:
        """Analyze LNG contract for risks and opportunities
        
        Uses vector store to find similar contracts and clauses for comparison.
        """
        
        # First, index and search similar contracts
        similar_contracts = []
        if self.tools_enabled and self.tools_manager:
            try:
                similar_contracts = self._find_similar_contracts(contract_text, contract_id)
                # Index the new contract for future searches
                self.tools_manager.index_contract(contract_id, contract_text, {
                    "counterparty": counterparty,
                    "indexed_date": __import__('datetime').datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Non-fatal error in ContractAgent tools: {e}")
        
        # Parse using domain models
        analysis = self.parser.parse_lng_contract(contract_text, contract_id, counterparty)
        
        # Find similar clauses
        similar_clauses = []
        if self.tools_enabled and self.tools_manager:
            similar_clauses = self._find_similar_clauses(analysis)
        
        # Enhance with AI for deeper insights
        if self.groq_available and len(contract_text) > 100:
            ai_analysis = self._get_ai_contract_analysis(contract_text, analysis)
        else:
            ai_analysis = self._get_mock_contract_analysis()
        
        return {
            "contract_id": contract_id,
            "counterparty": counterparty,
            "overall_risk_score": analysis.overall_risk_score,
            "risk_level": self._get_risk_level(analysis.overall_risk_score),
            "contract_summary": analysis.contract_summary,
            "key_risks": self._extract_key_risks(analysis),
            "negotiation_points": analysis.key_negotiation_points,
            "compliance_issues": analysis.compliance_issues,
            "estimated_value_at_risk_usd": analysis.estimated_value_at_risk_usd,
            "ai_insights": self._normalize_ai_contract_analysis(ai_analysis),
            "similar_contracts": similar_contracts[:3] if similar_contracts else [],
            "similar_clauses": similar_clauses[:5] if similar_clauses else [],
            "recommendation": self._get_recommendation(analysis.overall_risk_score),
            "data_sources": ["domain_analysis", "vector_search", "ai_insights"]
        }
    
    def _find_similar_contracts(self, contract_text: str, contract_id: str) -> List[Dict]:
        """Find similar contracts using vector search"""
        try:
            # Use first 500 chars as search query
            query = contract_text[:500]
            similar = self.tools_manager.search_contracts(query, top_k=3)
            
            # Filter out the current contract
            return [c for c in similar if c.get("contract_id") != contract_id]
        except Exception as e:
            print(f"Error finding similar contracts: {e}")
            return []
    
    def _find_similar_clauses(self, analysis) -> List[Dict]:
        """Find similar clauses from other contracts"""
        try:
            similar_clauses = []
            
            # Search for price adjustment clauses
            if hasattr(analysis, 'clauses'):
                for clause in analysis.clauses[:3]:
                    if hasattr(clause, 'clause_type'):
                        clause_text = getattr(clause, 'text', '')
                        if clause_text:
                            similar = self.tools_manager.find_similar_clauses(
                                clause_text,
                                clause_type=clause.clause_type.value
                            )
                            similar_clauses.extend(similar)
            
            return similar_clauses
        except Exception as e:
            print(f"Error finding similar clauses: {e}")
            return []
    
    def _get_risk_level(self, score: float) -> str:
        if score >= 70:
            return "high"
        elif score >= 50:
            return "medium"
        else:
            return "low"
    
    def _extract_key_risks(self, analysis) -> list:
        """Extract key risks from analysis"""
        risks = []
        try:
            if hasattr(analysis, 'clauses') and analysis.clauses:
                for clause in analysis.clauses:
                    if hasattr(clause, 'risk_score') and clause.risk_score > 60:
                        risks.append({
                            "clause": str(clause.clause_type.value) if hasattr(clause.clause_type, 'value') else str(clause.clause_type),
                            "risk_score": clause.risk_score,
                            "recommendation": getattr(clause, 'recommendation', 'Refine clause terms')
                        })
        except Exception as e:
            print(f"Error in _extract_key_risks: {e}")
        
        return risks[:5]  # Top 5 risks
    
    def _get_recommendation(self, risk_score: float) -> str:
        if risk_score >= 70:
            return "Legal review required before signing. High-risk clauses identified."
        elif risk_score >= 50:
            return "Negotiate key terms before signing. Medium risk."
        else:
            return "Proceed with standard review. Low risk."
    
    def _get_ai_contract_analysis(self, contract_text: str, analysis) -> Dict:
        """Get AI-powered contract insights"""
        
        system_prompt = """You are Shell's Legal AI Agent specializing in LNG contracts.
        Analyze the contract and return JSON with: hidden_risks (list), negotiation_leverage (string), market_comparison (string), recommendation (string), summary (string)."""
        
        user_prompt = f"""
        Contract Excerpt: {contract_text[:1500]}
        Detected Clauses: {len(analysis.clauses)}
        Contract Summary: {analysis.contract_summary}
        Overall Risk: {analysis.overall_risk_score}
        Key Negotiation Points: {analysis.key_negotiation_points}
        Compliance Issues: {analysis.compliance_issues}
        
        Provide legal, commercial, and market-aware insights in valid JSON.
        """
        
        return self._call_groq(system_prompt, user_prompt)
    
    def _normalize_ai_contract_analysis(self, analysis: Any) -> Dict[str, Any]:
        if not isinstance(analysis, dict):
            return {
                "hidden_risks": [],
                "negotiation_leverage": "",
                "market_comparison": "",
                "recommendation": "",
                "summary": ""
            }

        normalized = {
            "hidden_risks": analysis.get("hidden_risks") if isinstance(analysis.get("hidden_risks"), list) else [analysis.get("hidden_risks")] if analysis.get("hidden_risks") else [],
            "negotiation_leverage": analysis.get("negotiation_leverage", ""),
            "market_comparison": analysis.get("market_comparison", ""),
            "recommendation": analysis.get("recommendation", ""),
            "summary": analysis.get("summary", "")
        }
        return normalized

    def _get_mock_contract_analysis(self) -> Dict:
        """Mock analysis when Groq unavailable"""
        return {
            "hidden_risks": ["Destination restrictions may limit arbitrage opportunities"],
            "negotiation_leverage": "Market is softening - buyer has leverage",
            "market_comparison": "Slope is 0.5% above market average"
        }
    
    def search_contracts_semantic(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search for contracts using semantic similarity
        
        Args:
            query: Natural language search query
            top_k: Number of results to return
        
        Returns:
            List of relevant contracts
        """
        if not self.tools_enabled or not self.tools_manager:
            return []
        
        try:
            return self.tools_manager.search_contracts(query, top_k=top_k)
        except Exception as e:
            print(f"Error searching contracts: {e}")
            return []