import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from agents import ArbitrageAgent, ChurnAgent, ContractAgent, PricingAgent

app = FastAPI(title="Shell Horizon Commercial AI Agents")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Agent Protocol Violation", "details": str(exc)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pricing_agent = PricingAgent()
arbitrage_agent = ArbitrageAgent()
churn_agent = ChurnAgent()
contract_agent = ContractAgent()

class PricingRequest(BaseModel):
    commodity: str
    market_data: Dict[str, Any]

class ArbitrageRequest(BaseModel):
    market_prices: Dict[str, float]

class ChurnRequest(BaseModel):
    customer_data: Dict[str, Any]

class ContractRequest(BaseModel):
    contract_text: str
    contract_id: str
    counterparty: str

@app.post("/api/pricing")
async def get_pricing(req: PricingRequest):
    return pricing_agent.get_price_recommendation(
        commodity=req.commodity, market_data=req.market_data
    )

@app.post("/api/arbitrage")
async def get_arbitrage(req: ArbitrageRequest):
    return arbitrage_agent.detect_opportunities(
        market_prices=req.market_prices
    )

@app.post("/api/churn")
async def predict_churn(req: ChurnRequest):
    return churn_agent.predict_churn(
        customer_data=req.customer_data
    )

@app.post("/api/contract")
async def analyze_contract(req: ContractRequest):
    return contract_agent.analyze_contract(
        contract_text=req.contract_text,
        contract_id=req.contract_id,
        counterparty=req.counterparty
    )

@app.get("/health")
async def health():
    return {
        "PricingAgent": pricing_agent.health_check(),
        "ArbitrageAgent": arbitrage_agent.health_check(),
        "ChurnAgent": churn_agent.health_check(),
        "ContractAgent": contract_agent.health_check()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5005)
