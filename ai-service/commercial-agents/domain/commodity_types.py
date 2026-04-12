# domain/commodity_types.py
from enum import Enum
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import json

class CommodityCategory(Enum):
    CRUDE = "crude"
    LNG = "lng"
    REFINED_PRODUCTS = "refined_products"
    CARBON = "carbon"
    NATURAL_GAS = "natural_gas"
    POWER = "power"

class CrudeGrade(Enum):
    BRENT = "brent"
    WTI = "wti"
    DUBAI = "dubai"
    OPEC_BASKET = "opec_basket"
    URALS = "urals"

class LNGIndex(Enum):
    JCC = "jcc"
    HENRY_HUB = "henry_hub"
    TTF = "ttf"
    JKM = "jkm"

@dataclass
class CommoditySpec:
    """Specification for any commodity"""
    name: str
    category: CommodityCategory
    unit: str
    typical_volume: float
    volatility_annual: float
    carbon_intensity_tco2: float
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "category": self.category.value,
            "unit": self.unit,
            "typical_volume": self.typical_volume,
            "volatility": self.volatility_annual,
            "carbon_intensity": self.carbon_intensity_tco2
        }

class CommodityTypes:
    """Shell's commodity definitions for trading"""
    
    COMMODITIES = {
        "brent_crude": CommoditySpec(
            name="Brent Crude",
            category=CommodityCategory.CRUDE,
            unit="bbl",
            typical_volume=100000,
            volatility_annual=0.25,
            carbon_intensity_tco2=0.43
        ),
        "wti_crude": CommoditySpec(
            name="WTI Crude",
            category=CommodityCategory.CRUDE,
            unit="bbl",
            typical_volume=100000,
            volatility_annual=0.27,
            carbon_intensity_tco2=0.43
        ),
        "lng": CommoditySpec(
            name="Liquefied Natural Gas",
            category=CommodityCategory.LNG,
            unit="mmbtu",
            typical_volume=1000000,
            volatility_annual=0.35,
            carbon_intensity_tco2=0.28
        ),
        "jet_fuel": CommoditySpec(
            name="Jet Fuel",
            category=CommodityCategory.REFINED_PRODUCTS,
            unit="bbl",
            typical_volume=50000,
            volatility_annual=0.30,
            carbon_intensity_tco2=0.38
        ),
        "eu_carbon": CommoditySpec(
            name="EU Carbon Allowance",
            category=CommodityCategory.CARBON,
            unit="ton",
            typical_volume=10000,
            volatility_annual=0.40,
            carbon_intensity_tco2=1.0
        ),
        "natural_gas": CommoditySpec(
            name="Natural Gas",
            category=CommodityCategory.NATURAL_GAS,
            unit="mmbtu",
            typical_volume=500000,
            volatility_annual=0.32,
            carbon_intensity_tco2=0.20
        )
    }
    
    @classmethod
    def get_commodity(cls, name: str) -> Optional[CommoditySpec]:
        return cls.COMMODITIES.get(name.lower())
    
    @classmethod
    def list_all(cls) -> List[str]:
        return list(cls.COMMODITIES.keys())
    
    @classmethod
    def calculate_carbon_adjustment(cls, commodity_name: str, volume: float, carbon_price: float) -> float:
        spec = cls.get_commodity(commodity_name)
        if not spec:
            return 0.0
        emissions = volume * spec.carbon_intensity_tco2
        return emissions * carbon_price
    
    @classmethod
    def to_json(cls) -> str:
        return json.dumps({
            name: spec.to_dict() 
            for name, spec in cls.COMMODITIES.items()
        }, indent=2)