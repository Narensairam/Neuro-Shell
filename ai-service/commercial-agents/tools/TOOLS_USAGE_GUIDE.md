# tools/TOOLS_USAGE_GUIDE.md
# Agent Tools Integration Guide

This guide explains how to use the implemented tools with your AI agents.

## Available Tools

### 1. ETRM Client (`etrm_client.py`)
**Purpose**: Access trading deals, positions, and cash flows from OpenLink Endur ETRM system.

**Key Methods:**
- `get_deals()` - Retrieve trading deals by commodity, entity, status
- `get_positions()` - Get current trading positions and exposures
- `get_cash_flow()` - Get projected cash flows from active deals
- `create_deal()` - Create new trading deals

**Example Usage in Agents:**
```python
# In PricingAgent or ArbitrageAgent
deals = self.tools_manager.get_deals(commodity="LNG")
positions = self.tools_manager.get_positions()
```

### 2. SAP Client (`sap_client.py`)
**Purpose**: Integrate with SAP S/4HANA for materials, purchase orders, and invoices.

**Key Methods:**
- `get_materials()` - Search materials/products
- `get_purchase_orders()` - Retrieve PO data
- `get_invoices()` - Get invoice information
- `create_purchase_order()` - Create new POs
- `update_material_price()` - Update pricing

**Example Usage in Agents:**
```python
# In any agent needing supply chain data
materials = self.tools_manager.get_materials(search_term="LNG")
purchase_orders = self.tools_manager.get_purchase_orders(vendor="BP")
```

### 3. Salesforce Client (`salesforce_client.py`)
**Purpose**: Access CRM data for accounts, opportunities, contacts.

**Key Methods:**
- `get_accounts()` - Search and filter accounts
- `get_opportunities()` - Get sales opportunities
- `get_contacts()` - Retrieve contact information
- `create_opportunity()` - Create new sales opportunities
- `update_opportunity_stage()` - Update opportunity status

**Example Usage in Agents:**
```python
# In ChurnAgent or any B2B agent
accounts = self.tools_manager.get_accounts(industry="Energy")
opportunities = self.tools_manager.get_opportunities(stage="Proposal")
```

### 4. PI Historian (`pi_historian.py`)
**Purpose**: Read operational data from OSIsoft PI System.

**Key Methods:**
- `get_tag_list()` - List available sensor tags
- `get_tag_data()` - Retrieve historical time series data
- `get_real_time_value()` - Get current sensor readings
- `get_summary_stats()` - Calculate statistical summaries
- `get_alerts_and_events()` - Retrieve system alerts

**Example Usage in Agents:**
```python
# In operational monitoring agents
flow_data = self.tools_manager.get_sensor_data("WELL_PROD_FLOW", hours_back=24)
current_value = self.tools_manager.get_real_time_sensors("WELL_PRESSURE")
```

### 5. Market Data Client (`market_data.py`)
**Purpose**: Access commodity market prices and trends.

**Key Methods:**
- `get_lng_prices()` - Get LNG pricing indices (JCC, Platts JKM, etc.)
- `get_oil_prices()` - Get crude oil prices (Brent, WTI, etc.)
- `get_natural_gas_prices()` - Get natural gas prices
- `get_futures_prices()` - Get futures contract prices
- `get_price_history()` - Get historical price data
- `get_volatility()` - Calculate price volatility

**Example Usage in Agents:**
```python
# In PricingAgent
lng_prices = self.tools_manager.get_lng_prices(market="JCC")
oil_prices = self.tools_manager.get_oil_prices(crude="Brent")
futures = self.tools_manager.get_futures_prices("LNG", months=3)
```

### 6. Vector Store (`vector_store.py`)
**Purpose**: Semantic search for contracts using embeddings.

**Key Methods:**
- `index_contract()` - Add contract to search index
- `search_contracts()` - Find similar contracts
- `find_similar_clauses()` - Find similar contract clauses
- `get_contract_summary()` - Get AI summary of contract
- `delete_contract()` - Remove contract from index

**Example Usage in Agents:**
```python
# In ContractAgent
similar = self.tools_manager.search_contracts("price adjustment clause")
clauses = self.tools_manager.find_similar_clauses("force majeure", clause_type="Force Majeure")
```

## Tools Manager

The `ToolsManager` class provides unified access to all tools:

```python
from tools.tools_manager import ToolsManager

# Initialize once (usually in agent __init__)
tools = ToolsManager()

# Access any tool method
deals = tools.get_deals(entity="Shell", commodity="LNG")
accounts = tools.get_accounts(industry="Energy")
```

## Enabling Tools in Agents

All agents inherit from `BaseGroqAgent` which now supports tools:

```python
class PricingAgent(BaseGroqAgent):
    def __init__(self):
        super().__init__("PricingAgent")
        # tools_manager is now available as self.tools_manager
        # use self.tools_enabled to check if tools are connected
```

### Using Tools in Agent Methods

```python
def get_price_recommendation(self, commodity: str):
    # Check if tools are enabled
    if self.tools_enabled and self.tools_manager:
        # Fetch real data
        market_data = self.tools_manager.get_lng_prices()
    else:
        # Use mock data
        market_data = {}
```

## Environment Variables

Configure connections by setting environment variables:

### ETRM
```bash
ENDUR_HOST=endur-prod.shell.com
ENDUR_PORT=7777
```

### SAP
```bash
SAP_SERVER=sap-prod.shell.com
SAP_CLIENT=100
SAP_USER=admin
SAP_PASSWORD=password
```

### Salesforce
```bash
SALESFORCE_INSTANCE_URL=https://shell.salesforce.com
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=admin
SALESFORCE_PASSWORD=password
```

### PI Historian
```bash
PI_SERVER=pi-prod.shell.com
PI_USERNAME=admin
PI_PASSWORD=password
```

### Market Data
```bash
MARKET_DATA_PROVIDER=platts  # or argus, ice
MARKET_DATA_API_KEY=your_api_key
```

### Vector Store
```bash
VECTOR_STORE_BACKEND=chroma  # or pinecone
VECTOR_STORE_HOST=localhost
PINECONE_API_KEY=your_pinecone_key
```

## Health Checks

All tools support health checks:

```python
# Check individual tool
health = self.tools_manager.etrm.health_check()

# Check all tools
all_health = self.tools_manager.health_check()
```

## Mock Mode

When credentials are not provided, tools operate in mock mode with realistic test data. This allows testing without actual system connections.

## Error Handling

Tools gracefully degrade when connections fail:

```python
try:
    data = self.tools_manager.get_deals()
except Exception as e:
    # Fall back to mock data
    data = self._get_mock_data()
```

## Integration Examples

### Pricing Agent with Market Data
```python
def get_price_recommendation(self, commodity: str):
    if self.tools_enabled:
        # Fetch real market data
        lng_data = self.tools_manager.get_lng_prices()
        market_price = lng_data["prices"]["jcc_average"]
    else:
        market_price = 12.50
    
    # Use in pricing calculation
    return self._calculate_price(market_price)
```

### Contract Agent with Vector Search
```python
def analyze_contract(self, contract_text: str, contract_id: str):
    if self.tools_enabled:
        # Index for future searches
        self.tools_manager.index_contract(contract_id, contract_text)
        
        # Find similar contracts
        similar = self.tools_manager.search_contracts(contract_text[:500])
    else:
        similar = []
    
    # Use in analysis
    return self._compare_with_similar(similar)
```

### Churn Agent with Salesforce
```python
def predict_churn(self, customer_id: str):
    if self.tools_enabled:
        # Fetch customer data
        accounts = self.tools_manager.get_accounts()
        opportunities = self.tools_manager.get_opportunities()
    else:
        accounts = []
        opportunities = []
    
    # Calculate churn risk
    return self._calculate_risk(accounts, opportunities)
```

## Performance Notes

- Tools cache connections for efficiency
- Mock mode data is instantiated rapidly
- Real connections may take 500ms - 5s depending on system latency
- Batch operations when possible to reduce overhead

## Troubleshooting

### Tools Not Connecting
1. Check environment variables are set
2. Verify network connectivity to systems
3. Check credentials are correct
4. Monitor will be in mock mode

### Slow Tool Responses
1. Check system availability
2. Network timeouts default to 30s
3. May need to adjust timeout in tool initialization

### Missing Data
- Vector search requires indexed contracts first
- Market data needs API subscription
- PI tags must exist in system
