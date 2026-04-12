# domain/pricing_models.py
import numpy as np
from typing import Dict
from dataclasses import dataclass

@dataclass
class PriceForecast:
    current_price: float
    forecast_price: float
    confidence_lower: float
    confidence_upper: float
    volatility: float
    expected_move_percent: float
    time_horizon_days: int

class PricingModels:
    """Shell-specific pricing models"""
    
    LNG_SLOPES = {
        "jcc": 0.14,
        "brent": 0.135,
        "henry_hub": 0.12,
        "ttf": 0.11
    }
    
    @staticmethod
    def calculate_lng_jcc_price(jcc_crude_price: float, slope: float = 0.14, intercept: float = 0.50) -> float:
        return (jcc_crude_price * slope) + intercept
    
    @staticmethod
    def calculate_lng_henry_hub_price(henry_hub_price: float, liquefaction_cost: float = 3.50, shipping: float = 2.00) -> float:
        return henry_hub_price + liquefaction_cost + shipping
    
    @staticmethod
    def calculate_brent_wti_spread(brent_price: float, wti_price: float) -> float:
        return brent_price - wti_price
    
    @staticmethod
    def calculate_crack_spread(crude_price: float, product_price: float, yield_ratio: float = 0.45) -> float:
        return (product_price * yield_ratio) - crude_price

    @staticmethod
    def calculate_power_price(natural_gas_price: float, heat_rate: float = 7.5, carbon_price: float = 0.0, emissions_rate: float = 0.4) -> float:
        fuel_cost = natural_gas_price * heat_rate / 1000
        carbon_cost = carbon_price * emissions_rate
        return fuel_cost + carbon_cost + 15.0

    @staticmethod
    def calculate_carbon_credit_price(base_price: float, growth_rate: float = 0.08, liquidity_premium: float = 2.0) -> float:
        return base_price * (1 + growth_rate) + liquidity_premium

    @staticmethod
    def monte_carlo_forecast(
        current_price: float,
        volatility: float,
        drift: float = 0.03,
        days: int = 30,
        simulations: int = 10000,
        confidence_level: float = 0.90
    ) -> Dict:
        dt = 1 / 252
        prices = np.zeros((simulations, days))
        prices[:, 0] = current_price
        
        for t in range(1, days):
            random_shock = np.random.normal(0, 1, simulations)
            prices[:, t] = prices[:, t-1] * np.exp(
                (drift - 0.5 * volatility**2) * dt +
                volatility * np.sqrt(dt) * random_shock
            )
        
        final_prices = prices[:, -1]
        
        lower_percentile = (1 - confidence_level) / 2
        upper_percentile = 1 - lower_percentile
        
        return {
            "expected_price": float(np.mean(final_prices)),
            "median_price": float(np.median(final_prices)),
            "p10": float(np.percentile(final_prices, 10)),
            "p50": float(np.percentile(final_prices, 50)),
            "p90": float(np.percentile(final_prices, 90)),
            "std_dev": float(np.std(final_prices)),
            "var_95": float(np.percentile(final_prices, 5)),
            "cvar_95": float(np.mean(final_prices[final_prices <= np.percentile(final_prices, 5)])),
            "confidence_interval": {
                "lower": float(np.percentile(final_prices, lower_percentile * 100)),
                "upper": float(np.percentile(final_prices, upper_percentile * 100))
            }
        }
    
    @staticmethod
    def calculate_carbon_adjusted_price(base_price: float, carbon_price: float, emissions_per_unit: float) -> float:
        carbon_cost = carbon_price * emissions_per_unit
        return base_price + carbon_cost

class PricingCalculator:
    def __init__(self):
        self.models = PricingModels()
    
    def get_lng_price(self, index: str, index_price: float) -> float:
        if index == "jcc":
            slope = PricingModels.LNG_SLOPES.get("jcc", 0.14)
            return PricingModels.calculate_lng_jcc_price(index_price, slope=slope)
        elif index == "henry_hub":
            return PricingModels.calculate_lng_henry_hub_price(index_price)
        else:
            return index_price
    
    def generate_price_scenarios(self, current_price: float, volatility: float) -> Dict[str, float]:
        return {
            "pessimistic_60": round(current_price * 0.60, 2),
            "baseline_100": round(current_price, 2),
            "optimistic_140": round(current_price * 1.40, 2),
            "value_at_risk_95": round(current_price * (1 - 1.645 * volatility), 2)
        }