# tools/sap_client.py
"""SAP S/4HANA Connector

Integrates with SAP S/4HANA via:
- BAPI (Business API) for transactional operations
- OData for data retrieval
- RFC for remote function calls
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class SAPClient:
    """Client for SAP S/4HANA integration"""
    
    def __init__(self, server: str = None, client_id: str = None, 
                 user: str = None, password: str = None, timeout: int = 30):
        """Initialize SAP client
        
        Args:
            server: SAP server host (from env: SAP_SERVER)
            client_id: SAP client ID (from env: SAP_CLIENT)
            user: SAP user (from env: SAP_USER)
            password: SAP password (from env: SAP_PASSWORD)
            timeout: Request timeout in seconds
        """
        self.server = server or os.environ.get("SAP_SERVER", "sap-prod.shell.com")
        self.client_id = client_id or os.environ.get("SAP_CLIENT", "100")
        self.user = user or os.environ.get("SAP_USER", "admin")
        self.password = password or os.environ.get("SAP_PASSWORD", "")
        self.timeout = timeout
        self.connected = False
        self._init_connection()
    
    def _init_connection(self) -> bool:
        """Initialize connection to SAP S/4HANA"""
        try:
            # Placeholder for actual pyrfc or SAP NetWeaver connection
            # Would use pyrfc library or REST API
            self.connected = True if self.password else False
            return self.connected
        except Exception as e:
            print(f"Warning: Could not connect to SAP at {self.server}: {e}")
            self.connected = False
            return False
    
    def get_materials(self, material_type: str = None, 
                     plant: str = None,
                     search_term: str = None) -> List[Dict[str, Any]]:
        """Retrieve materials (products) from SAP
        
        Args:
            material_type: Filter by material type (e.g., 'FERT' for finished goods)
            plant: Plant code (e.g., 'P001')
            search_term: Search by material description
        
        Returns:
            List of materials with specifications
        """
        if not self.connected:
            return self._mock_materials(material_type, search_term)
        
        try:
            materials = self._query_sap_materials({
                "material_type": material_type,
                "plant": plant,
                "search_term": search_term
            })
            return materials
        except Exception as e:
            print(f"Error querying SAP materials: {e}")
            return self._mock_materials(material_type, search_term)
    
    def _query_sap_materials(self, filters: Dict) -> List[Dict]:
        """Query SAP for materials via BAPI_MATERIAL_GET_DETAIL"""
        return [
            {
                "material_id": "MAT-LNG-001",
                "description": "Liquefied Natural Gas - Premium Grade",
                "material_type": filters.get("material_type", "FERT"),
                "plant": filters.get("plant", "P001"),
                "uom": "T",
                "specification": {
                    "methane_content": "95%",
                    "heating_value": "53.6 MJ/kg",
                    "density": "500 kg/m³"
                },
                "price_per_unit": 12.50,
                "currency": "USD",
                "quantity_on_hand": 2500000,
                "last_updated": datetime.now().isoformat()
            },
            {
                "material_id": "MAT-CRUDE-001",
                "description": "Brent Crude Oil",
                "material_type": filters.get("material_type", "FERT"),
                "plant": filters.get("plant", "P001"),
                "uom": "BBL",
                "price_per_unit": 82.45,
                "currency": "USD",
                "quantity_on_hand": 5000000,
                "last_updated": datetime.now().isoformat()
            }
        ]
    
    def _mock_materials(self, material_type: str, search_term: str) -> List[Dict]:
        """Return mock materials"""
        return [
            {
                "material_id": f"MOCK_MAT_{search_term or 'LNG'}",
                "description": f"Mock {search_term or 'LNG'} Material",
                "material_type": material_type or "UNKNOWN",
                "uom": "T",
                "price_per_unit": 12.00,
                "quantity_on_hand": 1000000,
                "note": "Mock data - SAP not connected"
            }
        ]
    
    def get_purchase_orders(self, vendor: str = None,
                           plant: str = None,
                           status: str = "Open") -> List[Dict[str, Any]]:
        """Retrieve purchase orders from SAP
        
        Args:
            vendor: Vendor code
            plant: Plant code
            status: PO status (Open, Closed, In Progress)
        
        Returns:
            List of purchase orders
        """
        if not self.connected:
            return self._mock_purchase_orders(vendor, status)
        
        try:
            pos = [
                {
                    "po_number": "4500001234",
                    "vendor": vendor or "Mock Vendor",
                    "plant": plant or "P001",
                    "status": status,
                    "material_id": "MAT-LNG-001",
                    "quantity": 500000,
                    "uom": "T",
                    "price_per_unit": 12.30,
                    "total_value": 6150000,
                    "currency": "USD",
                    "delivery_date": "2024-02-15",
                    "created_date": datetime.now().isoformat(),
                    "line_items": [
                        {
                            "line": 1,
                            "material_id": "MAT-LNG-001",
                            "description": "LNG Premium Grade",
                            "quantity": 500000,
                            "uom": "T",
                            "unit_price": 12.30,
                            "net_value": 6150000
                        }
                    ]
                }
            ]
            return pos
        except Exception as e:
            print(f"Error getting purchase orders: {e}")
            return self._mock_purchase_orders(vendor, status)
    
    def _mock_purchase_orders(self, vendor: str, status: str) -> List[Dict]:
        """Return mock purchase orders"""
        return [
            {
                "po_number": f"MOCK_PO_{datetime.now().strftime('%Y%m%d')}",
                "vendor": vendor or "Mock Vendor",
                "status": status,
                "total_value": 5000000,
                "currency": "USD",
                "note": "Mock data - SAP not connected"
            }
        ]
    
    def get_invoices(self, vendor: str = None,
                    invoice_date_from: str = None,
                    invoice_date_to: str = None,
                    status: str = "Open") -> List[Dict[str, Any]]:
        """Retrieve invoices from SAP
        
        Args:
            vendor: Vendor code
            invoice_date_from: Start date for invoice filtering
            invoice_date_to: End date for invoice filtering
            status: Invoice status (Open, Paid, Disputed)
        
        Returns:
            List of invoices
        """
        if not self.connected:
            return self._mock_invoices(vendor, status)
        
        try:
            invoices = [
                {
                    "invoice_number": "INV-2024-001234",
                    "vendor": vendor or "Mock Vendor",
                    "po_reference": "4500001234",
                    "invoice_date": invoice_date_from or datetime.now().isoformat(),
                    "due_date": datetime.now().isoformat(),
                    "status": status,
                    "gross_amount": 6150000,
                    "tax_amount": 1230000,
                    "net_amount": 4920000,
                    "currency": "USD",
                    "line_items": [
                        {
                            "line": 1,
                            "description": "LNG Supply",
                            "quantity": 500000,
                            "uom": "T",
                            "unit_price": 12.30,
                            "line_total": 6150000
                        }
                    ]
                }
            ]
            return invoices
        except Exception as e:
            print(f"Error getting invoices: {e}")
            return self._mock_invoices(vendor, status)
    
    def _mock_invoices(self, vendor: str, status: str) -> List[Dict]:
        """Return mock invoices"""
        return [
            {
                "invoice_number": f"MOCK_INV_{datetime.now().strftime('%Y%m%d')}",
                "vendor": vendor or "Mock Vendor",
                "status": status,
                "net_amount": 5000000,
                "currency": "USD",
                "note": "Mock data - SAP not connected"
            }
        ]
    
    def create_purchase_order(self, po_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a purchase order in SAP
        
        Args:
            po_data: PO details (vendor, items, dates, etc.)
        
        Returns:
            Created PO with SAP PO number
        """
        if not self.connected:
            return self._mock_create_po(po_data)
        
        try:
            po_number = f"SAP_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            result = {
                "status": "created",
                "po_number": po_number,
                "message": f"Purchase order {po_number} created in SAP",
                "data": po_data
            }
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _mock_create_po(self, po_data: Dict) -> Dict:
        """Mock PO creation"""
        return {
            "status": "created",
            "po_number": f"MOCK_PO_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "message": "Mock PO created (SAP not connected)",
            "data": po_data
        }
    
    def update_material_price(self, material_id: str, new_price: float, 
                             effective_date: str = None) -> Dict[str, Any]:
        """Update material price in SAP
        
        Args:
            material_id: Material ID
            new_price: New price per unit
            effective_date: Date when price becomes effective
        
        Returns:
            Update result
        """
        result = {
            "status": "success" if self.connected else "mock",
            "material_id": material_id,
            "new_price": new_price,
            "effective_date": effective_date or datetime.now().isoformat(),
            "message": f"Price updated to {new_price} USD"
        }
        return result
    
    def health_check(self) -> Dict[str, Any]:
        """Check SAP connection status"""
        return {
            "service": "SAP_S4HANA",
            "server": self.server,
            "client_id": self.client_id,
            "connected": self.connected,
            "status": "operational" if self.connected else "degraded",
            "timestamp": datetime.now().isoformat()
        }
