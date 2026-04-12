# example_tools_usage.py
"""
Comprehensive examples of using tools with agents

Run with: python example_tools_usage.py
"""

from agents.pricing_agent import PricingAgent
from agents.contract_agent import ContractAgent
from agents.arbitrage_agent import ArbitrageAgent
from agents.churn_agent import ChurnAgent
from tools.tools_manager import ToolsManager
import json


def example_1_pricing_with_market_data():
    """Example: Get pricing recommendations using real market data"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Pricing Agent with Market Data Tools")
    print("="*60)
    
    agent = PricingAgent()
    
    # Check if tools are available
    if agent.tools_enabled:
        print("\n✓ Tools enabled - using real market data feeds")
        
        # Get LNG price recommendation with real data
        result = agent.get_price_recommendation("lng")
        
        print(f"\nLNG Price Recommendation:")
        print(f"  Technical Price: ${result['technical_price_usd']}")
        print(f"  AI Adjusted Price: ${result['ai_adjusted_price_usd']}")
        print(f"  Volatility: {result['volatility']*100:.1f}%")
        print(f"  Confidence Interval: ${result['confidence_interval']['lower']} - ${result['confidence_interval']['upper']}")
        print(f"  Risk Factors: {', '.join(result['risk_factors'])}")
    else:
        print("\n✗ Tools not available - using mock data")


def example_2_contract_search():
    """Example: Analyze contract and find similar ones"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Contract Agent with Vector Search")
    print("="*60)
    
    agent = ContractAgent()
    
    # Sample contract text
    contract_text = """
    This LNG Supply Agreement between Shell and BP Trading contains:
    - Monthly volume: 50,000 MMBtu
    - Price: JCC-linked with 0.5% premium
    - Delivery: FOB Qatar
    - Payment: 90 days after delivery
    - Force majeure: Standard provisions apply
    """
    
    # Analyze contract
    result = agent.analyze_contract(
        contract_text=contract_text,
        contract_id="CONTRACT_2024_001",
        counterparty="BP Trading"
    )
    
    print(f"\nContract Analysis:")
    print(f"  Risk Score: {result['overall_risk_score']}")
    print(f"  Risk Level: {result['risk_level'].upper()}")
    print(f"  Recommendation: {result['recommendation']}")
    print(f"  Value at Risk: ${result['estimated_value_at_risk_usd']:,.0f}")
    
    if result['similar_contracts']:
        print(f"\n  Similar Contracts Found: {len(result['similar_contracts'])}")
        for i, contract in enumerate(result['similar_contracts'], 1):
            print(f"    {i}. {contract.get('contract_id')} (Match: {contract.get('similarity_score')*100:.0f}%)")


def example_3_arbitrage_detection():
    """Example: Detect arbitrage opportunities with live prices"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Arbitrage Agent with Market Data")
    print("="*60)
    
    agent = ArbitrageAgent()
    
    if agent.tools_enabled:
        print("\n✓ Fetching real market prices for arbitrage analysis...")
        result = agent.detect_opportunities()
        
        print(f"\nArbitrage Opportunities Found: {result['opportunities_found']}")
        if result['opportunities']:
            print(f"Market Sentiment: {result['market_sentiment']}")
            
            if result['best_opportunity']['found']:
                best = result['best_opportunity']
                print(f"\nBest Opportunity:")
                print(f"  Type: {best['type']}")
                print(f"  Estimated P&L: ${best['estimated_pnl']:.2f}")
                print(f"  Risk Score: {best['risk_score']}")
        
        print(f"\nData Sources: {', '.join(result['data_sources'])}")
    else:
        print("\n✗ Tools not available - using mock market data")


def example_4_churn_prediction():
    """Example: Predict customer churn with CRM and ERP data"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Churn Agent with Salesforce Integration")
    print("="*60)
    
    agent = ChurnAgent()
    
    # Customer data
    customer_data = {
        "customer_id": "ACME_Energy_Corp",
        "customer_name": "ACME Energy Corporation",
        "segment": "B2B_Energy",
        "region": "EMEA",
        "contract_value": 50000000,
        "contract_start": "2021-06-15",
        "avg_volume": 100000,
        "volume_trend": -15.5,
        "complaints": 3,
        "late_payments": 1,
        "years_customer": 2.5
    }
    
    result = agent.predict_churn(customer_data)
    
    print(f"\nChurn Prediction for {customer_data['customer_name']}:")
    print(f"  Churn Risk Score: {result['churn_risk_score']:.1f}/100")
    print(f"  Risk Level: {result['risk_level'].upper()}")
    print(f"  Priority: {result['priority'].upper()}")
    print(f"\n  Primary Drivers:")
    for driver in result['primary_drivers'][:3]:
        print(f"    • {driver}")
    
    print(f"\n  Recommended Actions:")
    for i, action in enumerate(result['recommended_actions'][:3], 1):
        print(f"    {i}. {action}")
    
    if result['sales_opportunities']:
        print(f"\n  Active Sales Opportunities: {len(result['sales_opportunities'])}")
        for opp in result['sales_opportunities']:
            print(f"    • {opp.get('opportunity')} ({opp.get('stage')})")


def example_5_tools_manager_direct():
    """Example: Direct usage of ToolsManager"""
    print("\n" + "="*60)
    print("EXAMPLE 5: Direct ToolsManager Usage")
    print("="*60)
    
    tools = ToolsManager()
    
    print("\nSystem Health Check:")
    health = tools.health_check()
    
    for system_name, system_health in health['systems'].items():
        status_icon = "✓" if system_health.get('status') == 'operational' else "✗"
        print(f"  {status_icon} {system_name}: {system_health.get('status')}")
    
    print("\n\nExample Tool Calls:")
    
    # Get accounts
    print("\n1. Salesforce Accounts:")
    accounts = tools.get_accounts(industry="Energy")
    if accounts:
        print(f"   Found {len(accounts)} accounts")
        for acc in accounts[:2]:
            print(f"   - {acc.get('name')} (Rating: {acc.get('rating')})")
    
    # Get market prices
    print("\n2. Market Prices (LNG):")
    lng = tools.get_lng_prices()
    print(f"   JCC Average: ${lng['prices'].get('jcc_average')} {lng['currency']}")
    
    # Get ETRM deals
    print("\n3. Trading Deals:")
    deals = tools.get_deals()
    if deals:
        print(f"   Found {len(deals)} deals")
        for deal in deals[:2]:
            print(f"   - {deal.get('deal_id')}: {deal.get('counterparty')} ({deal.get('volume')} {deal.get('unit')})")
    
    # Get SAP materials
    print("\n4. SAP Materials:")
    materials = tools.get_materials()
    if materials:
        print(f"   Found {len(materials)} materials")
        for mat in materials[:2]:
            print(f"   - {mat.get('material_id')}: {mat.get('description')}")
    
    # Get PI sensor data
    print("\n5. Sensor Data (PI Historian):")
    sensors = tools.get_real_time_sensors("WELL_PRESSURE")
    if sensors:
        print(f"   {sensors.get('tag_name')}: {sensors.get('value')} {sensors.get('unit_of_measure', '')}")


def example_6_agent_health_check():
    """Example: Check health of all agents with their tools"""
    print("\n" + "="*60)
    print("EXAMPLE 6: Agent Health Checks")
    print("="*60)
    
    agents = [
        ("PricingAgent", PricingAgent()),
        ("ContractAgent", ContractAgent()),
        ("ArbitrageAgent", ArbitrageAgent()),
        ("ChurnAgent", ChurnAgent())
    ]
    
    for agent_name, agent in agents:
        health = agent.health_check()
        
        print(f"\n{agent_name}:")
        print(f"  Model: {health['model']}")
        print(f"  Groq Available: {'✓' if health['groq_available'] else '✗'}")
        print(f"  Tools Enabled: {'✓' if health['tools_enabled'] else '✗'}")
        print(f"  Status: {health['status']}")


def main():
    """Run all examples"""
    print("\n" + "="*60)
    print("AGENT TOOLS INTEGRATION EXAMPLES")
    print("="*60)
    
    examples = [
        ("Pricing with Market Data", example_1_pricing_with_market_data),
        ("Contract Search", example_2_contract_search),
        ("Arbitrage Detection", example_3_arbitrage_detection),
        ("Churn Prediction", example_4_churn_prediction),
        ("Direct ToolsManager", example_5_tools_manager_direct),
        ("Agent Health Checks", example_6_agent_health_check),
    ]
    
    for i, (name, func) in enumerate(examples, 1):
        try:
            func()
        except Exception as e:
            print(f"\nError running example {i}: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*60)
    print("EXAMPLES COMPLETED")
    print("="*60)


if __name__ == "__main__":
    main()
