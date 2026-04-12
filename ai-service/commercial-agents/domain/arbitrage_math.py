# domain/arbitrage_math.py
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class ArbitrageType(Enum):
    CRACK_SPREAD = "crack_spread"
    SPARK_SPREAD = "spark_spread"
    DARK_SPREAD = "dark_spread"
    CROSS_COMMODITY = "cross_commodity"

@dataclass
class ArbitrageOpportunity:
    opportunity_type: ArbitrageType
    buy_asset: str
    sell_asset: str
    spread_value: float
    estimated_pnl_per_unit: float
    max_volume_units: float
    execution_time_hours: float
    risk_score: float
    requires_approval: bool
    carbon_impact_tons: float

class SpreadAnalysis:
    
    @staticmethod
    def calculate_3_2_1_crack_spread(crude_price: float, gasoline_price: float, diesel_price: float) -> float:
        product_value = (2 * gasoline_price + 1 * diesel_price) / 3
        return product_value - crude_price

    @staticmethod
    def calculate_lng_to_gas_spread(lng_price: float, henry_hub_price: float, regas_cost: float = 0.50) -> float:
        delivered_gas_cost = lng_price + regas_cost
        return henry_hub_price - delivered_gas_cost

    @staticmethod
    def calculate_spark_spread(natural_gas_price: float, power_price: float, heat_rate: float = 7.5) -> float:
        generation_cost = natural_gas_price * heat_rate / 1000
        return power_price - generation_cost

    @staticmethod
    def calculate_dark_spread(natural_gas_price: float, power_price: float, co2_price: float, emissions_rate: float = 0.4, heat_rate: float = 7.5) -> float:
        fuel_cost = natural_gas_price * heat_rate / 1000
        emissions_cost = co2_price * emissions_rate
        return power_price - (fuel_cost + emissions_cost)

    @staticmethod
    def calculate_crude_quality_spread(brent_price: float, heavy_sour_price: float) -> float:
        return brent_price - heavy_sour_price

    @staticmethod
    def normalize_market_prices(market_prices: Dict[str, float]) -> Dict[str, float]:
        normalized = {}
        aliases = {
            "oil": "brent",
            "crude": "brent",
            "wti": "wti",
            "gas": "natural_gas",
            "ng": "natural_gas",
            "power": "power",
            "electricity": "power",
            "carbon": "carbon",
            "co2": "carbon",
            "lng": "lng",
            "diesel": "diesel",
            "gasoline": "gasoline",
            "naphtha": "naphtha"
        }
        for key, value in market_prices.items():
            normalized_key = aliases.get(str(key).lower(), str(key).lower())
            try:
                normalized[normalized_key] = float(value)
            except (TypeError, ValueError):
                continue
        return normalized

class ArbitrageCalculator:
    
    def __init__(self):
        self.spread_analysis = SpreadAnalysis()
    
    def detect_arbitrage_opportunities(self, market_prices: Dict[str, float]) -> List[ArbitrageOpportunity]:
        opportunities = []
        market_prices = SpreadAnalysis.normalize_market_prices(market_prices)

        if all(k in market_prices for k in ["brent", "gasoline", "diesel"]):
            crack = SpreadAnalysis.calculate_3_2_1_crack_spread(
                market_prices["brent"],
                market_prices["gasoline"],
                market_prices["diesel"]
            )
            if crack > 5.0:
                opportunities.append(ArbitrageOpportunity(
                    opportunity_type=ArbitrageType.CRACK_SPREAD,
                    buy_asset="brent_crude",
                    sell_asset="refined_products",
                    spread_value=round(crack, 2),
                    estimated_pnl_per_unit=round(crack * 0.85, 2),
                    max_volume_units=500000,
                    execution_time_hours=24,
                    risk_score=35,
                    requires_approval=True,
                    carbon_impact_tons=215000
                ))

        if "lng" in market_prices and "natural_gas" in market_prices:
            gas_lng_spread = SpreadAnalysis.calculate_lng_to_gas_spread(
                market_prices["lng"],
                market_prices["natural_gas"]
            )
            if gas_lng_spread > 2.0:
                opportunities.append(ArbitrageOpportunity(
                    opportunity_type=ArbitrageType.CROSS_COMMODITY,
                    buy_asset="natural_gas",
                    sell_asset="lng",
                    spread_value=round(gas_lng_spread, 2),
                    estimated_pnl_per_unit=round(gas_lng_spread * 0.9, 2),
                    max_volume_units=1000000,
                    execution_time_hours=48,
                    risk_score=50,
                    requires_approval=True,
                    carbon_impact_tons=280000
                ))

        if "natural_gas" in market_prices and "power" in market_prices:
            spark = SpreadAnalysis.calculate_spark_spread(
                market_prices["natural_gas"],
                market_prices["power"]
            )
            if spark > 4.0:
                opportunities.append(ArbitrageOpportunity(
                    opportunity_type=ArbitrageType.SPARK_SPREAD,
                    buy_asset="natural_gas",
                    sell_asset="power",
                    spread_value=round(spark, 2),
                    estimated_pnl_per_unit=round(spark * 0.75, 2),
                    max_volume_units=250000,
                    execution_time_hours=12,
                    risk_score=40,
                    requires_approval=False,
                    carbon_impact_tons=125000
                ))

        if all(k in market_prices for k in ["natural_gas", "power", "carbon"]):
            dark = SpreadAnalysis.calculate_dark_spread(
                market_prices["natural_gas"],
                market_prices["power"],
                market_prices["carbon"]
            )
            if dark > 3.5:
                opportunities.append(ArbitrageOpportunity(
                    opportunity_type=ArbitrageType.DARK_SPREAD,
                    buy_asset="natural_gas",
                    sell_asset="power",
                    spread_value=round(dark, 2),
                    estimated_pnl_per_unit=round(dark * 0.65, 2),
                    max_volume_units=180000,
                    execution_time_hours=18,
                    risk_score=45,
                    requires_approval=False,
                    carbon_impact_tons=98000
                ))

        return opportunities
    
    def monte_carlo_arbitrage_simulation(
        self,
        asset1_price: float,
        asset2_price: float,
        correlation: float,
        volatility1: float,
        volatility2: float,
        days: int = 30,
        simulations: int = 5000
    ) -> Dict:
        dt = 1 / 252
        mean_rets = [0.03, 0.03]
        
        cov_matrix = np.array([[volatility1**2, correlation * volatility1 * volatility2],
                               [correlation * volatility1 * volatility2, volatility2**2]])
        
        L = np.linalg.cholesky(cov_matrix)
        
        prices1 = np.zeros((simulations, days))
        prices2 = np.zeros((simulations, days))
        prices1[:, 0] = asset1_price
        prices2[:, 0] = asset2_price
        
        for t in range(1, days):
            z = np.random.normal(0, 1, (simulations, 2))
            correlated_shocks = z @ L.T
            
            prices1[:, t] = prices1[:, t-1] * np.exp((mean_rets[0] - 0.5 * volatility1**2) * dt + 
                                                      correlated_shocks[:, 0] * np.sqrt(dt))
            prices2[:, t] = prices2[:, t-1] * np.exp((mean_rets[1] - 0.5 * volatility2**2) * dt +
                                                      correlated_shocks[:, 1] * np.sqrt(dt))
        
        spreads = prices1[:, -1] - prices2[:, -1]
        prob_arbitrage = np.mean(spreads > 0)
        
        return {
            "probability_arbitrage": float(prob_arbitrage),
            "expected_spread": float(np.mean(spreads)),
            "max_spread": float(np.max(spreads)),
            "min_spread": float(np.min(spreads)),
            "spread_std": float(np.std(spreads)),
            "var_95_spread": float(np.percentile(spreads, 5)),
            "recommended_position": "large" if prob_arbitrage > 0.70 else "medium" if prob_arbitrage > 0.50 else "small"
        }