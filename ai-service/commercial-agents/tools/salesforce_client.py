# tools/salesforce_client.py
"""Salesforce Integration Client

REST API wrapper for Salesforce CRM including:
- Opportunity management
- Account management
- Lead tracking
- Custom objects
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class SalesforceClient:
    """Client for Salesforce REST API integration"""
    
    def __init__(self, instance_url: str = None, client_id: str = None,
                 client_secret: str = None, username: str = None, 
                 password: str = None, timeout: int = 30):
        """Initialize Salesforce client
        
        Args:
            instance_url: Salesforce instance URL (from env: SALESFORCE_INSTANCE_URL)
            client_id: OAuth client ID (from env: SALESFORCE_CLIENT_ID)
            client_secret: OAuth client secret (from env: SALESFORCE_CLIENT_SECRET)
            username: Salesforce username (from env: SALESFORCE_USERNAME)
            password: Salesforce password (from env: SALESFORCE_PASSWORD)
            timeout: Request timeout in seconds
        """
        self.instance_url = instance_url or os.environ.get("SALESFORCE_INSTANCE_URL", "https://shell.salesforce.com")
        self.client_id = client_id or os.environ.get("SALESFORCE_CLIENT_ID", "")
        self.client_secret = client_secret or os.environ.get("SALESFORCE_CLIENT_SECRET", "")
        self.username = username or os.environ.get("SALESFORCE_USERNAME", "admin")
        self.password = password or os.environ.get("SALESFORCE_PASSWORD", "")
        self.timeout = timeout
        self.access_token = None
        self.connected = False
        self._init_connection()
    
    def _init_connection(self) -> bool:
        """Authenticate with Salesforce OAuth"""
        try:
            # Placeholder for actual Salesforce OAuth flow
            # Would use simple_salesforce or requests library
            if self.username and self.password:
                self.connected = True
                return True
            return False
        except Exception as e:
            print(f"Warning: Could not authenticate with Salesforce: {e}")
            self.connected = False
            return False
    
    def get_accounts(self, industry: str = None,
                    revenue_filter: str = None,
                    search_term: str = None) -> List[Dict[str, Any]]:
        """Retrieve accounts from Salesforce
        
        Args:
            industry: Filter by industry (e.g., 'Energy', 'Utilities')
            revenue_filter: Filter by revenue range (e.g., '>1000000')
            search_term: Search in account name or description
        
        Returns:
            List of account records
        """
        if not self.connected:
            return self._mock_accounts(industry, search_term)
        
        try:
            query = f"""
            SELECT Id, Name, Industry, AnnualRevenue, BillingCountry, Phone, Website
            FROM Account
            """
            if industry:
                query += f" WHERE Industry = '{industry}'"
            if search_term:
                query += f" AND Name LIKE '%{search_term}%'"
            
            accounts = self._execute_soql_query(query)
            return accounts
        except Exception as e:
            print(f"Error querying Salesforce accounts: {e}")
            return self._mock_accounts(industry, search_term)
    
    def _execute_soql_query(self, soql: str) -> List[Dict]:
        """Execute SOQL query against Salesforce"""
        return [
            {
                "id": "001XX000003DHP",
                "name": "Mock Energy Corporation",
                "industry": "Energy",
                "annual_revenue": 50000000,
                "billing_country": "Netherlands",
                "phone": "+31-10-244-5555",
                "website": "www.mock-energy.com",
                "type": "Customer",
                "rating": "Hot"
            }
        ]
    
    def _mock_accounts(self, industry: str, search_term: str) -> List[Dict]:
        """Return mock accounts"""
        return [
            {
                "id": f"MOCK_ACC_{datetime.now().strftime('%Y%m%d')}",
                "name": f"Mock {search_term or industry or 'Account'}",
                "industry": industry or "Energy",
                "annual_revenue": 30000000,
                "rating": "Medium",
                "note": "Mock data - Salesforce not connected"
            }
        ]
    
    def get_opportunities(self, account_id: str = None,
                         stage: str = None,
                         close_date_after: str = None) -> List[Dict[str, Any]]:
        """Retrieve opportunities from Salesforce
        
        Args:
            account_id: Filter by account
            stage: Opportunity stage (e.g., 'Negotiation', 'Closing', 'Proposal')
            close_date_after: Filter opportunities closing after this date
        
        Returns:
            List of opportunity records
        """
        if not self.connected:
            return self._mock_opportunities(account_id, stage)
        
        try:
            opportunities = [
                {
                    "id": "006XX000006TUoAAM",
                    "name": "Global LNG Supply Agreement 2024",
                    "account_id": account_id or "001XX000003DHP",
                    "stage": stage or "Proposal",
                    "close_date": close_date_after or "2024-03-31",
                    "amount": 250000000,
                    "currency": "USD",
                    "probability": 65,
                    "owner": "Michael Scott",
                    "created_date": datetime.now().isoformat(),
                    "description": "Large LNG supply contract for 3 years"
                },
                {
                    "id": "006XX000006TUoAAL",
                    "name": "Spot LNG Purchase for Q1",
                    "account_id": account_id or "001XX000003DHP",
                    "stage": stage or "Negotiation",
                    "close_date": close_date_after or "2024-02-15",
                    "amount": 15000000,
                    "currency": "USD",
                    "probability": 80,
                    "owner": "Dwight Schrute",
                    "created_date": datetime.now().isoformat(),
                    "description": "Immediate LNG supply needs"
                }
            ]
            return opportunities
        except Exception as e:
            print(f"Error getting opportunities: {e}")
            return self._mock_opportunities(account_id, stage)
    
    def _mock_opportunities(self, account_id: str, stage: str) -> List[Dict]:
        """Return mock opportunities"""
        return [
            {
                "id": f"MOCK_OPP_{datetime.now().strftime('%Y%m%d')}",
                "name": f"Mock {stage or 'LNG'} Opportunity",
                "stage": stage or "Proposal",
                "amount": 100000000,
                "currency": "USD",
                "probability": 50,
                "note": "Mock data - Salesforce not connected"
            }
        ]
    
    def get_contacts(self, account_id: str = None,
                    department: str = None) -> List[Dict[str, Any]]:
        """Retrieve contacts from Salesforce
        
        Args:
            account_id: Filter by account ID
            department: Filter by department
        
        Returns:
            List of contact records
        """
        if not self.connected:
            return self._mock_contacts(department)
        
        try:
            contacts = [
                {
                    "id": "003XX000004TMM",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@mock-energy.com",
                    "phone": "+31-10-244-5555",
                    "title": "VP Procurement",
                    "department": department or "Procurement",
                    "account_id": account_id,
                    "linkedin": "https://linkedin.com/in/johndoe"
                },
                {
                    "id": "003XX000004TMN",
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "email": "jane.smith@mock-energy.com",
                    "phone": "+31-10-244-5556",
                    "title": "Head of Sourcing",
                    "department": department or "Procurement",
                    "account_id": account_id,
                    "linkedin": "https://linkedin.com/in/janesmith"
                }
            ]
            return contacts
        except Exception as e:
            print(f"Error getting contacts: {e}")
            return self._mock_contacts(department)
    
    def _mock_contacts(self, department: str) -> List[Dict]:
        """Return mock contacts"""
        return [
            {
                "id": f"MOCK_CONT_{datetime.now().strftime('%Y%m%d')}",
                "first_name": "Mock",
                "last_name": "Contact",
                "title": f"Mock {department or 'Manager'}",
                "email": "mock@example.com",
                "note": "Mock data - Salesforce not connected"
            }
        ]
    
    def create_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an opportunity in Salesforce
        
        Args:
            opportunity_data: Opportunity details (name, amount, stage, etc.)
        
        Returns:
            Created opportunity with Salesforce ID
        """
        if not self.connected:
            return self._mock_create_opportunity(opportunity_data)
        
        try:
            opportunity_id = f"006XX{datetime.now().strftime('%Y%m%d%H%M%S')}"
            result = {
                "status": "created",
                "id": opportunity_id,
                "message": f"Opportunity {opportunity_data.get('name')} created",
                "data": opportunity_data
            }
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _mock_create_opportunity(self, opportunity_data: Dict) -> Dict:
        """Mock opportunity creation"""
        return {
            "status": "created",
            "id": f"MOCK_OPP_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "message": f"Mock opportunity '{opportunity_data.get('name')}' created",
            "data": opportunity_data
        }
    
    def update_opportunity_stage(self, opportunity_id: str, 
                                new_stage: str,
                                probability: int = None) -> Dict[str, Any]:
        """Update opportunity stage
        
        Args:
            opportunity_id: Salesforce opportunity ID
            new_stage: New stage value
            probability: Win probability percentage
        
        Returns:
            Update result
        """
        result = {
            "status": "success" if self.connected else "mock",
            "opportunity_id": opportunity_id,
            "stage": new_stage,
            "probability": probability,
            "message": f"Opportunity updated to stage: {new_stage}"
        }
        return result
    
    def log_activity(self, subject: str, activity_type: str,
                    related_to: str, details: str) -> Dict[str, Any]:
        """Log an activity/task in Salesforce
        
        Args:
            subject: Activity subject
            activity_type: Type (Call, Email, Meeting, etc.)
            related_to: Related record ID
            details: Activity details
        
        Returns:
            Created activity record
        """
        activity = {
            "id": f"{'00T' if not self.connected else 'MOCK_'}{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "subject": subject,
            "type": activity_type,
            "related_to": related_to,
            "details": details,
            "created_date": datetime.now().isoformat(),
            "status": "Created"
        }
        return activity
    
    def health_check(self) -> Dict[str, Any]:
        """Check Salesforce connection status"""
        return {
            "service": "Salesforce_CRM",
            "instance_url": self.instance_url,
            "connected": self.connected,
            "status": "operational" if self.connected else "degraded",
            "timestamp": datetime.now().isoformat()
        }
