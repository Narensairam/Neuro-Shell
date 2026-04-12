# QUICK REFERENCE - Tools API

## ToolsManager Methods

### ETRM (Trading System)
```python
tools.get_deals(entity="Shell", commodity="LNG")
    # Returns: List[Deal] with volume, price, counterparty, dates

tools.get_positions(entity="Shell")
    # Returns: Dict with net/long/short volumes, exposures by commodity

tools.get_cash_flow(entity="Shell", start_date, end_date)
    # Returns: List[CashFlow] with projected settlements
```

### SAP (Supply Chain)
```python
tools.get_materials(search_term="LNG")
    # Returns: List[Material] with specs, prices, inventory

tools.get_purchase_orders(vendor="BP")
    # Returns: List[PO] with items, dates, amounts

tools.get_invoices(vendor="BP", status="Open")
    # Returns: List[Invoice] with amounts, due dates
```

### Salesforce (CRM)
```python
tools.get_accounts(industry="Energy")
    # Returns: List[Account] with revenue, contacts, ratings

tools.get_opportunities(stage="Proposal")
    # Returns: List[Opportunity] with amounts, close dates, probability

tools.get_contacts(account_id="001XX000003DHP")
    # Returns: List[Contact] with names, emails, titles
```

### PI Historian (Operations)
```python
tools.get_real_time_sensors(tag_name="WELL_PRESSURE")
    # Returns: Dict with current value, timestamp, quality

tools.get_sensor_data(tag_name="WELL_PROD_FLOW", hours_back=24)
    # Returns: Dict with time series data points, min/max/avg

tools.get_alerts_and_events(tag_name="WELL_PRESSURE")
    # Returns: List[Alert] with severity, time, message
```

### Market Data (Pricing)
```python
tools.get_lng_prices(market="JCC")
    # Returns: Dict with jcc_average, platts_jkm, cif_japan, cif_europe

tools.get_oil_prices(crude="Brent")
    # Returns: Dict with spot, bid/ask, futures by month

tools.get_gas_prices(market="Henry_Hub")
    # Returns: Dict with spot, forward curves by months

tools.get_futures_prices(commodity="LNG", months=3)
    # Returns: List[FuturesContract] with OHLC, volume, dates

tools.get_volatility(commodity="LNG")
    # Returns: Dict with historical, implied, trend analysis
```

### Vector Store (Search)
```python
tools.search_contracts(query="price adjustment", top_k=5)
    # Returns: List[Contract] sorted by relevance score

tools.index_contract(contract_id="CONTRACT_001", text, metadata)
    # Indexes contract for future search

tools.find_similar_clauses(clause_text, clause_type="Price")
    # Returns: List[Clause] with similar text from other contracts
```

## Agent Usage Examples

### PricingAgent
```python
from agents import PricingAgent

agent = PricingAgent()

# Example 1: Get price recommendation (auto-fetches market data)
result = agent.get_price_recommendation("lng")
# {
#   "technical_price_usd": 12.45,
#   "ai_adjusted_price_usd": 12.50,
#   "volatility": 0.18,
#   "confidence_interval": {"lower": 10.21, "upper": 14.69},
#   "risk_factors": ["Supply disruptions", "Weather", "Geopolitical"]
# }

# Example 2: Provide market data manually
market_data = {
    "jcc_crude": 82.50,
    "spot_price": 12.50,
    "volatility": 0.18
}
result = agent.get_price_recommendation("lng", market_data)
```

### ContractAgent
```python
from agents import ContractAgent

agent = ContractAgent()

contract_text = """LNG Supply Agreement: 50,000 MMBtu/month,
JCC-linked price, 90-day payment terms, FOB Qatar"""

result = agent.analyze_contract(
    contract_text=contract_text,
    contract_id="CONTRACT_2024_001",
    counterparty="BP Trading"
)
# {
#   "overall_risk_score": 45,
#   "risk_level": "medium",
#   "key_risks": [...],
#   "similar_contracts": [...],
#   "similar_clauses": [...],
#   "recommendation": "Negotiate key terms..."
# }

# Search for contracts
results = agent.search_contracts_semantic(
    "Find LNG contracts with destination restrictions"
)
```

### ArbitrageAgent
```python
from agents import ArbitrageAgent

agent = ArbitrageAgent()

# Example 1: Auto-fetch market prices
results = agent.detect_opportunities()
# {
#   "opportunities_found": 3,
#   "opportunities": [...],
#   "best_opportunity": {
#     "type": "crack_spread",
#     "estimated_pnl": 2.45,
#     "risk_score": 35
#   }
# }

# Example 2: Provide prices manually
prices = {
    "lng_jcc": 12.50,
    "brent_crude": 82.45,
    "henry_hub": 3.50
}
results = agent.detect_opportunities(market_prices=prices)
```

### ChurnAgent
```python
from agents import ChurnAgent

agent = ChurnAgent()

# Example 1: Predict churn with customer data
customer = {
    "customer_id": "ACME_CORP",
    "contract_value": 50000000,
    "volume_trend": -15.5,
    "complaints": 3
}
result = agent.predict_churn(customer)
# {
#   "churn_risk_score": 72.5,
#   "risk_level": "high",
#   "primary_drivers": ["Declining volume", "Support issues"],
#   "recommended_actions": ["Schedule meeting", "Offer discount"],
#   "sales_opportunities": [...]
# }

# Example 2: Auto-fetch from Salesforce
result = agent.predict_churn(customer_id="001XX000003DHP")
```

## Health Checks

```python
# Individual tool
etrm_health = tools.get_tool("etrm").health_check()
# {
#   "service": "ETRM_Endur",
#   "host": "endur-prod.shell.com",
#   "connected": True/False,
#   "status": "operational" / "degraded"
# }

# All tools
all_health = tools.health_check()
# Returns health for: etrm, sap, salesforce, pi_historian, market_data, vector_store

# Agent with tools
agent_health = agent.health_check()
# Shows agent status + tools status
```

## Filter Parameters

### Get Deals
- `entity`: "Shell", "Subsidiary"
- `commodity`: "LNG", "Oil", "Gas"
- `status`: "Active", "Closed", "Pending"
- `start_date`: "2024-01-01" (ISO format)
- `end_date`: "2024-12-31" (ISO format)

### Get Accounts
- `industry`: "Energy", "Utilities", "Manufacturing"
- `revenue_filter`: ">1000000", "<500000"
- `search_term`: "BP", "Shell", "Total"

### Get Opportunities
- `account_id`: "001XX000003DHP"
- `stage`: "Proposal", "Negotiation", "Closing"
- `close_date_after`: "2024-03-31"

### Get Market Prices
- `market`: "JCC" (LNG), "Brent"/"WTI" (Oil), "Henry_Hub"/"NBP"/"TTF" (Gas)
- `commodity`: "LNG", "Oil", "Gas"
- `contract_months`: 1-12 (for futures)
- `days_back`: 30-365 (for history)

## Error Handling

All tools automatically fall back to mock data on errors:

```python
# If API fails or not configured, returns realistic mock data
deals = tools.get_deals()  # Works even with no ENDUR connection

# Check connection status
if tools.get_tool("etrm").connected:
    print("Using real ETRM data")
else:
    print("Using mock ETRM data")
```

## Performance Notes

- Mock mode: < 10ms per call
- Real connections: 500ms - 5s
- Cached connections: ~100ms
- Large result sets: May need pagination (future)

## Mock Data Features

All tools provide realistic mock data including:
- Proper data structures and types
- Realistic value ranges
- Multiple records for list operations
- Proper timestamps and dates
- Cross-reference consistency

Perfect for:
- Development and testing
- Demonstrations
- CI/CD pipelines
- Training environments

---

For complete documentation, see:
- `tools/TOOLS_USAGE_GUIDE.md` - Full reference
- `TOOLS_IMPLEMENTATION.md` - Architecture
- `example_tools_usage.py` - Runnable examples
