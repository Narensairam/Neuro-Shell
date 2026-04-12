# domain/contract_parser.py
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import json

class ClauseType(Enum):
    PRICING = "pricing_formula"
    VOLUME = "take_or_pay"
    DESTINATION = "destination_clause"
    FORCE_MAJEURE = "force_majeure"
    QUALITY = "quality_specification"
    PAYMENT = "payment_terms"
    DISPUTE = "dispute_resolution"

@dataclass
class ExtractedClause:
    clause_type: ClauseType
    text: str
    risk_score: float
    recommendation: str

@dataclass
class LNGContractAnalysis:
    contract_id: str
    counterparty: str
    analysis_date: datetime
    clauses: List[ExtractedClause]
    overall_risk_score: float
    key_negotiation_points: List[str]
    compliance_issues: List[str]
    estimated_value_at_risk_usd: float
    pricing_structure: Dict
    volume_commitments: Dict
    contract_summary: str

class LNGClauseExtractor:
    
    PATTERNS = {
        "pricing_jcc": r"(?i)(price|pricing).{0,50}(jcc|japan crude cocktail)",
        "pricing_henry_hub": r"(?i)(price|pricing).{0,50}(henry hub|hh)",
        "take_or_pay": r"(?i)(take[- ]or[- ]pay|top).{0,100}(\d{1,3}%)",
        "destination": r"(?i)(destination|delivery point).{0,100}(flexible|restricted)",
        "force_majeure": r"(?i)(force majeure).{0,100}(\d{1,3} days?)",
        "volume_commitment": r"(?i)(annual volume|quantity).{0,50}(\d+(?:\.\d+)?)\s*(million|mm|tons?)",
        "payment_terms": r"(?i)(payment terms|net \d{1,3})",
        "quality_specification": r"(?i)(quality|specification|API gravity|sulfur content)",
        "dispute_resolution": r"(?i)(dispute resolution|arbitration|court|jurisdiction)"
    }
    
    RISK_KEYWORDS = {
        "high": ["restricted", "penalty", "no refund", "irrevocable", "exclusive", "fixed destination", "strict nomination"],
        "medium": ["at seller's option", "reasonable efforts", "negotiated", "best efforts", "soft landing"],
        "low": ["flexible", "mutual agreement", "good faith", "market based"]
    }
    
    @classmethod
    def extract_clauses(cls, contract_text: str, contract_id: str, counterparty: str) -> LNGContractAnalysis:
        extracted_clauses = []
        pricing_structure = {}
        volume_commitments = {}
        
        for clause_name, pattern in cls.PATTERNS.items():
            matches = re.finditer(pattern, contract_text, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                clause_text = match.group(0)
                clause_type = cls._map_to_clause_type(clause_name)
                risk_score = cls._calculate_clause_risk(clause_text)
                recommendation = cls._generate_recommendation(clause_type, risk_score)
                
                extracted_clauses.append(ExtractedClause(
                    clause_type=clause_type,
                    text=clause_text[:500],
                    risk_score=risk_score,
                    recommendation=recommendation
                ))
                
                if clause_type == ClauseType.PRICING:
                    pricing_structure = cls._parse_pricing_clause(clause_text)
                elif clause_type == ClauseType.VOLUME:
                    volume_commitments = cls._parse_volume_clause(clause_text)
                elif clause_type == ClauseType.PAYMENT:
                    payment_terms = cls._parse_payment_clause(clause_text)
                    if payment_terms:
                        volume_commitments.update(payment_terms)
                elif clause_type == ClauseType.QUALITY:
                    pricing_structure.update(cls._parse_quality_clause(clause_text) or {})
                elif clause_type == ClauseType.DISPUTE:
                    pricing_structure.setdefault('dispute_resolution', clause_text.strip())
        
        overall_risk = cls._calculate_overall_risk(extracted_clauses)
        negotiation_points = cls._identify_negotiation_points(extracted_clauses)
        compliance_issues = cls._check_compliance(extracted_clauses)
        value_at_risk = cls._estimate_value_at_risk(extracted_clauses, volume_commitments)
        contract_summary = cls._build_contract_summary(extracted_clauses)
        
        return LNGContractAnalysis(
            contract_id=contract_id,
            counterparty=counterparty,
            analysis_date=datetime.now(),
            clauses=extracted_clauses,
            overall_risk_score=overall_risk,
            key_negotiation_points=negotiation_points,
            compliance_issues=compliance_issues,
            estimated_value_at_risk_usd=value_at_risk,
            pricing_structure=pricing_structure,
            volume_commitments=volume_commitments,
            contract_summary=contract_summary
        )
    
    @classmethod
    def _map_to_clause_type(cls, pattern_name: str) -> ClauseType:
        mapping = {
            "pricing_jcc": ClauseType.PRICING,
            "pricing_henry_hub": ClauseType.PRICING,
            "take_or_pay": ClauseType.VOLUME,
            "destination": ClauseType.DESTINATION,
            "force_majeure": ClauseType.FORCE_MAJEURE,
            "volume_commitment": ClauseType.VOLUME,
            "payment_terms": ClauseType.PAYMENT,
            "quality_specification": ClauseType.QUALITY,
            "dispute_resolution": ClauseType.DISPUTE
        }
        return mapping.get(pattern_name, ClauseType.PRICING)
    
    @classmethod
    def _calculate_clause_risk(cls, clause_text: str) -> float:
        risk_score = 0.0
        text_lower = clause_text.lower()
        
        for keyword in cls.RISK_KEYWORDS["high"]:
            if keyword.lower() in text_lower:
                risk_score += 15
        
        for keyword in cls.RISK_KEYWORDS["medium"]:
            if keyword.lower() in text_lower:
                risk_score += 8
        
        for keyword in cls.RISK_KEYWORDS["low"]:
            if keyword.lower() in text_lower:
                risk_score -= 10
        
        return min(100, max(0, risk_score))
    
    @classmethod
    def _generate_recommendation(cls, clause_type: ClauseType, risk_score: float) -> str:
        if clause_type == ClauseType.PRICING:
            return "Review pricing formula for indexation, slope, and carbon pass-through."
        elif clause_type == ClauseType.VOLUME:
            return "Negotiate flexible take-or-pay and make-up rights."
        elif clause_type == ClauseType.DESTINATION:
            return "Seek destination flexibility to preserve arbitrage optionality."
        elif clause_type == ClauseType.FORCE_MAJEURE:
            return "Confirm force majeure covers geopolitical and LNG shipping disruptions."
        elif clause_type == ClauseType.PAYMENT:
            return "Ensure payment terms reflect market risk and buyer credit profile."
        elif clause_type == ClauseType.QUALITY:
            return "Validate quality specifications against cargo blending and compliance limits."
        elif clause_type == ClauseType.DISPUTE:
            return "Evaluate dispute resolution jurisdiction and arbitration structure."
        return f"Review clause with legal and trading teams. Risk score: {risk_score:.0f}"
    
    @classmethod
    def _calculate_overall_risk(cls, clauses: List[ExtractedClause]) -> float:
        if not clauses:
            return 50.0
        return sum(c.risk_score for c in clauses) / len(clauses)
    
    @classmethod
    def _identify_negotiation_points(cls, clauses: List[ExtractedClause]) -> List[str]:
        points = []
        for clause in clauses:
            if clause.risk_score > 60:
                points.append(f"{clause.clause_type.value}: {clause.recommendation[:100]}")
        return points[:5]
    
    @classmethod
    def _parse_pricing_clause(cls, clause_text: str) -> Dict:
        lower = clause_text.lower()
        return {
            "formula": "JCC-linked" if "jcc" in lower else "Henry Hub-linked" if "henry hub" in lower else "market-indexed",
            "index": "JCC" if "jcc" in lower else "Henry Hub" if "henry hub" in lower else "market"
        }

    @classmethod
    def _parse_volume_clause(cls, clause_text: str) -> Dict:
        annual_volume = None
        take_or_pay_pct = None
        volume_match = re.search(r"(\d+(?:\.\d+)?)\s*(million|mm|tons?)", clause_text, re.IGNORECASE)
        if volume_match:
            annual_volume = float(volume_match.group(1))
        top_match = re.search(r"(\d{1,3})%", clause_text)
        if top_match:
            take_or_pay_pct = float(top_match.group(1))
        return {
            "annual_volume_mtpa": annual_volume,
            "take_or_pay_percent": take_or_pay_pct
        }

    @classmethod
    def _parse_payment_clause(cls, clause_text: str) -> Dict:
        net_days = None
        match = re.search(r"net\s*(\d{1,3})", clause_text, re.IGNORECASE)
        if match:
            net_days = int(match.group(1))
        return {"payment_terms_days": net_days}

    @classmethod
    def _parse_quality_clause(cls, clause_text: str) -> Dict:
        return {"quality_note": clause_text.strip()}

    @classmethod
    def _check_compliance(cls, clauses: List[ExtractedClause]) -> List[str]:
        issues = []
        pricing_clauses = [c for c in clauses if c.clause_type == ClauseType.PRICING]
        if pricing_clauses and all("carbon" not in c.text.lower() for c in pricing_clauses):
            issues.append("Missing carbon pricing mechanism - EU ETS or voluntary credit exposure may be unpriced.")
        restricted_destinations = [c for c in clauses if c.clause_type == ClauseType.DESTINATION and "restricted" in c.text.lower()]
        if restricted_destinations:
            issues.append("Destination restrictions may limit LNG arbitrage and cargo redeployment.")
        return issues
    
    @classmethod
    def _estimate_value_at_risk(cls, clauses: List[ExtractedClause], volume_commitments: Dict) -> float:
        value_at_risk = 0
        if volume_commitments.get("annual_volume_mtpa") and volume_commitments.get("take_or_pay_percent"):
            value_at_risk += volume_commitments["annual_volume_mtpa"] * 1000000 * (volume_commitments["take_or_pay_percent"] / 100) * 5
        for clause in clauses:
            if clause.clause_type == ClauseType.DESTINATION and "restricted" in clause.text.lower():
                value_at_risk += 3000000
        return round(value_at_risk, 2)

    @classmethod
    def _build_contract_summary(cls, clauses: List[ExtractedClause]) -> str:
        if not clauses:
            return "No contract clauses were detected."
        summary_items = [f"{c.clause_type.value}: {c.recommendation}" for c in clauses[:4]]
        return " | ".join(summary_items)

class ContractParser:
    def __init__(self):
        self.extractor = LNGClauseExtractor()
    
    def parse_lng_contract(self, contract_text: str, contract_id: str, counterparty: str) -> LNGContractAnalysis:
        return self.extractor.extract_clauses(contract_text, contract_id, counterparty)
    
    def to_json(self, analysis: LNGContractAnalysis) -> str:
        return json.dumps({
            "contract_id": analysis.contract_id,
            "counterparty": analysis.counterparty,
            "overall_risk_score": analysis.overall_risk_score,
            "key_negotiation_points": analysis.key_negotiation_points,
            "compliance_issues": analysis.compliance_issues,
            "estimated_value_at_risk_usd": analysis.estimated_value_at_risk_usd,
            "contract_summary": analysis.contract_summary
        }, indent=2)