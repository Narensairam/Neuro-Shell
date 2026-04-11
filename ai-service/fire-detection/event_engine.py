import time
import datetime
import threading
from config import AppConfig

# Hub for JSON API Consumption
GLOBAL_ALERTS = []
GLOBAL_FRAMES = {}
GLOBAL_STATS = {
    "total_incidents": 0,
    "ppe_violations": 0,
    "intrusions": 0,
    "fire_hazards": 0,
    "anomalies": 0,
    "compliance_rate_pct": 100
}
STATE_LOCK = threading.Lock()

class EnterpriseEventEngine:
    def __init__(self, camera_id):
        self.camera_id = camera_id
        self.active_events = {}

    def process_event(self, event_type, confidence, payload, is_critical=False):
        """
        Debounce logic matrix with prioritization queues.
        """
        event_key = f"{event_type}_{payload.get('person_id', self.camera_id)}"
        
        if event_key not in self.active_events:
            self.active_events[event_key] = {"count": 1, "logged": False}
        else:
            self.active_events[event_key]["count"] += 1
            
        debounce_limit = 1 if is_critical else AppConfig.ALERT_DEBOUNCE_FRAMES
        
        if self.active_events[event_key]["count"] >= debounce_limit and not self.active_events[event_key]["logged"]:
            self._dispatch(event_type, confidence, payload)
            self.active_events[event_key]["logged"] = True
            
        # Update TTL for debounce recovery
        self.active_events[event_key]["last_seen"] = time.time()

    def tick_cleanup(self):
        """ Frame clock sync. Dropped events older than 5s will flush from memory queue. """
        now = time.time()
        expired = [k for k, v in self.active_events.items() if now - v["last_seen"] > 5.0]
        for e in expired:
            del self.active_events[e]

    def _dispatch(self, event_type, confidence, payload):
        with STATE_LOCK:
            GLOBAL_STATS["total_incidents"] += 1
            
            if event_type == "FIRE":
                GLOBAL_STATS["fire_hazards"] += 1
            elif event_type == "PPE_VIOLATION":
                GLOBAL_STATS["ppe_violations"] += 1
                # Adjust compliance algorithm for the dashboard analytics
                total = GLOBAL_STATS["total_incidents"]
                viols = GLOBAL_STATS["ppe_violations"]
                GLOBAL_STATS["compliance_rate_pct"] = max(0, 100 - int((viols / (total + 1)) * 100))
                
            # Formatting for EOS System Dashboard
            final_payload = {
                "id": f"evt-{int(time.time()*100)}",
                "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S"),
                "camera_id": self.camera_id,
                "confidence": confidence,
                **payload 
            }
            
            GLOBAL_ALERTS.insert(0, final_payload)
            if len(GLOBAL_ALERTS) > AppConfig.MAX_ALERTS_HISTORY:
                GLOBAL_ALERTS.pop()
                
        # Console output for testing
        print(f"[{final_payload['severity']} | {event_type}] 📢 {payload.get('recommended_action')} Data:{payload}")
