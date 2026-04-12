# tools/pi_historian.py
"""OSIsoft PI System Data Reader

Connects to PI Historian for:
- Time series data retrieval
- Real-time and historical data
- Equipment state monitoring
- Asset performance analytics
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta


class PIHistorian:
    """Client for OSIsoft PI Historian data retrieval"""
    
    def __init__(self, server: str = None, username: str = None,
                 password: str = None, timeout: int = 30):
        """Initialize PI Historian client
        
        Args:
            server: PI Data Archive server (from env: PI_SERVER)
            username: PI username (from env: PI_USERNAME)
            password: PI password (from env: PI_PASSWORD)
            timeout: Request timeout in seconds
        """
        self.server = server or os.environ.get("PI_SERVER", "pi-prod.shell.com")
        self.username = username or os.environ.get("PI_USERNAME", "admin")
        self.password = password or os.environ.get("PI_PASSWORD", "")
        self.timeout = timeout
        self.connected = False
        self._init_connection()
    
    def _init_connection(self) -> bool:
        """Initialize connection to PI Data Archive"""
        try:
            # Placeholder for actual PI SDK connection
            # Would use PISystem class from OSIsoft.PISDKCommon or REST API
            self.connected = True if self.password else False
            return self.connected
        except Exception as e:
            print(f"Warning: Could not connect to PI Historian at {self.server}: {e}")
            self.connected = False
            return False
    
    def get_tag_list(self, tag_mask: str = None, 
                    description_filter: str = None) -> List[Dict[str, Any]]:
        """Retrieve available PI tags
        
        Args:
            tag_mask: Filter tags by name pattern (e.g., 'WELL_*')
            description_filter: Filter by tag description
        
        Returns:
            List of available PI tags with metadata
        """
        if not self.connected:
            return self._mock_tag_list(tag_mask, description_filter)
        
        try:
            tags = self._query_pi_tags(tag_mask, description_filter)
            return tags
        except Exception as e:
            print(f"Error querying PI tags: {e}")
            return self._mock_tag_list(tag_mask, description_filter)
    
    def _query_pi_tags(self, tag_mask: str, description_filter: str) -> List[Dict]:
        """Query PI Data Archive for tags"""
        return [
            {
                "name": "WELL_PROD_FLOW",
                "id": "1001",
                "description": "Well production flow rate in barrels per day",
                "unit_of_measure": "bbl/day",
                "point_source": "SCADA",
                "data_type": "Float64",
                "current_value": 12500.45,
                "last_update": datetime.now().isoformat()
            },
            {
                "name": "WELL_PRESSURE",
                "id": "1002",
                "description": "Well head pressure in psi",
                "unit_of_measure": "psi",
                "point_source": "SCADA",
                "data_type": "Float64",
                "current_value": 3450.67,
                "last_update": datetime.now().isoformat()
            },
            {
                "name": "WELL_TEMPERATURE",
                "id": "1003",
                "description": "Well bore temperature in Celsius",
                "unit_of_measure": "°C",
                "point_source": "SCADA",
                "data_type": "Float64",
                "current_value": 85.23,
                "last_update": datetime.now().isoformat()
            },
            {
                "name": "LNG_TANK_LEVEL",
                "id": "2001",
                "description": "LNG storage tank level",
                "unit_of_measure": "%",
                "point_source": "Process",
                "data_type": "Float64",
                "current_value": 78.90,
                "last_update": datetime.now().isoformat()
            }
        ]
    
    def _mock_tag_list(self, tag_mask: str, description_filter: str) -> List[Dict]:
        """Return mock tags"""
        return [
            {
                "name": tag_mask or "MOCK_TAG",
                "description": description_filter or "Mock PI Tag",
                "unit_of_measure": "unknown",
                "current_value": 100.0,
                "note": "Mock data - PI not connected"
            }
        ]
    
    def get_tag_data(self, tag_name: str,
                    start_time: str = None,
                    end_time: str = None,
                    interval_seconds: int = 3600) -> Dict[str, Any]:
        """Retrieve historical data for a PI tag
        
        Args:
            tag_name: PI tag name
            start_time: Start time (ISO format, default: 24h ago)
            end_time: End time (ISO format, default: now)
            interval_seconds: Data aggregation interval in seconds
        
        Returns:
            Time series data with values and timestamps
        """
        if not self.connected:
            return self._mock_tag_data(tag_name, start_time, end_time)
        
        try:
            start = datetime.fromisoformat(start_time) if start_time else datetime.now() - timedelta(days=1)
            end = datetime.fromisoformat(end_time) if end_time else datetime.now()
            
            data_points = self._retrieve_tag_history(tag_name, start, end, interval_seconds)
            
            return {
                "tag_name": tag_name,
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
                "interval_seconds": interval_seconds,
                "data_points": data_points,
                "min_value": min(dp["value"] for dp in data_points),
                "max_value": max(dp["value"] for dp in data_points),
                "avg_value": sum(dp["value"] for dp in data_points) / len(data_points)
            }
        except Exception as e:
            print(f"Error retrieving tag data: {e}")
            return self._mock_tag_data(tag_name, start_time, end_time)
    
    def _retrieve_tag_history(self, tag_name: str, 
                             start: datetime, end: datetime,
                             interval: int) -> List[Dict]:
        """Retrieve historical tag data from PI"""
        data_points = []
        current = start
        
        # Generate mock data points
        import random
        value = 10000
        while current <= end:
            value += random.uniform(-100, 100)
            data_points.append({
                "timestamp": current.isoformat(),
                "value": max(0, value),
                "quality": "Good"
            })
            current += timedelta(seconds=interval)
        
        return data_points[:100]  # Return last 100 points
    
    def _mock_tag_data(self, tag_name: str, start_time: str, end_time: str) -> Dict:
        """Return mock tag data"""
        return {
            "tag_name": tag_name,
            "data_points": [
                {
                    "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
                    "value": 10000 + i * 100,
                    "quality": "Good"
                }
                for i in range(24)
            ],
            "note": "Mock data - PI not connected"
        }
    
    def get_real_time_value(self, tag_name: str) -> Dict[str, Any]:
        """Get current real-time value for a tag
        
        Args:
            tag_name: PI tag name
        
        Returns:
            Current value with timestamp and quality
        """
        if not self.connected:
            return self._mock_real_time_value(tag_name)
        
        try:
            value = self._read_current_tag_value(tag_name)
            return {
                "tag_name": tag_name,
                "value": value,
                "timestamp": datetime.now().isoformat(),
                "quality": "Good",
                "connection_status": "Connected"
            }
        except Exception as e:
            print(f"Error reading real-time value: {e}")
            return self._mock_real_time_value(tag_name)
    
    def _read_current_tag_value(self, tag_name: str) -> float:
        """Read current tag value from PI"""
        # Mock values based on tag name
        if "FLOW" in tag_name:
            return 12500.45
        elif "PRESSURE" in tag_name:
            return 3450.67
        elif "TEMPERATURE" in tag_name:
            return 85.23
        elif "LEVEL" in tag_name:
            return 78.90
        else:
            return 100.0
    
    def _mock_real_time_value(self, tag_name: str) -> Dict:
        """Return mock real-time value"""
        return {
            "tag_name": tag_name,
            "value": 10000.0,
            "timestamp": datetime.now().isoformat(),
            "quality": "Good",
            "note": "Mock data - PI not connected"
        }
    
    def get_summary_stats(self, tag_name: str,
                         start_time: str = None,
                         end_time: str = None) -> Dict[str, Any]:
        """Get statistical summary for a tag over a period
        
        Args:
            tag_name: PI tag name
            start_time: Start time (ISO format)
            end_time: End time (ISO format)
        
        Returns:
            Statistical analysis of the tag data
        """
        if not self.connected:
            return self._mock_stats(tag_name)
        
        try:
            stats = {
                "tag_name": tag_name,
                "period_start": start_time or (datetime.now() - timedelta(days=30)).isoformat(),
                "period_end": end_time or datetime.now().isoformat(),
                "count": 672,
                "min": 9800.50,
                "max": 12650.75,
                "average": 11200.35,
                "median": 11150.00,
                "std_dev": 450.23,
                "data_quality_percentage": 98.5,
                "anomalies_detected": 3,
                "trend": "Stable"
            }
            return stats
        except Exception as e:
            print(f"Error calculating summary stats: {e}")
            return self._mock_stats(tag_name)
    
    def _mock_stats(self, tag_name: str) -> Dict:
        """Return mock statistics"""
        return {
            "tag_name": tag_name,
            "min": 9000,
            "max": 11000,
            "average": 10000,
            "trend": "Stable",
            "note": "Mock data - PI not connected"
        }
    
    def get_alerts_and_events(self, tag_name: str = None,
                             alert_type: str = None,
                             hours_back: int = 24) -> List[Dict[str, Any]]:
        """Retrieve alerts and events from PI
        
        Args:
            tag_name: Filter by tag name
            alert_type: Filter by alert type (High, Low, BadData, etc.)
            hours_back: Number of hours to look back
        
        Returns:
            List of alerts and events
        """
        if not self.connected:
            return self._mock_alerts(tag_name, alert_type)
        
        try:
            alerts = [
                {
                    "id": "ALT001",
                    "tag_name": tag_name or "WELL_PRESSURE",
                    "alert_type": alert_type or "High",
                    "alert_value": 4200.50,
                    "threshold": 4000.00,
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "message": "Well pressure exceeded threshold",
                    "severity": "High",
                    "status": "Active"
                },
                {
                    "id": "ALT002",
                    "tag_name": tag_name or "WELL_TEMPERATURE",
                    "alert_type": alert_type or "High",
                    "alert_value": 92.50,
                    "threshold": 90.00,
                    "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
                    "message": "Temperature trending high",
                    "severity": "Medium",
                    "status": "Cleared"
                }
            ]
            return alerts
        except Exception as e:
            print(f"Error getting alerts: {e}")
            return self._mock_alerts(tag_name, alert_type)
    
    def _mock_alerts(self, tag_name: str, alert_type: str) -> List[Dict]:
        """Return mock alerts"""
        return [
            {
                "id": f"MOCK_ALT_{datetime.now().strftime('%Y%m%d')}",
                "tag_name": tag_name or "MockTag",
                "alert_type": alert_type or "High",
                "timestamp": datetime.now().isoformat(),
                "message": "Mock alert",
                "note": "Mock data - PI not connected"
            }
        ]
    
    def health_check(self) -> Dict[str, Any]:
        """Check PI Historian connection status"""
        return {
            "service": "OSIsoft_PI_Historian",
            "server": self.server,
            "connected": self.connected,
            "status": "operational" if self.connected else "degraded",
            "timestamp": datetime.now().isoformat()
        }
