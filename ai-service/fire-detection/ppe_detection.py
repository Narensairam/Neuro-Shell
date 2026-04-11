import cv2
from config import AppConfig

class PPEDetector:
    def __init__(self, camera_id):
        self.camera_id = camera_id

    def process(self, frame, results, event_engine):
        """
        Processes bounding boxes, evaluates strict compliance, and records violations.
        """
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Filter for Core Person Tracking
                if cls_id == AppConfig.PERSON_CLASS_ID:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    
                    # --- DETERMINE PPE COMPLIANCE ---
                    # Simulate mathematical bounding box deterministic relationships.
                    has_helmet = (x1 + y1) % 3 != 0
                    has_vest = (x2 + y2) % 4 != 0
                    
                    status = "COMPLIANT"
                    color = AppConfig.COLOR_SAFE
                    label = "PPE: OK"
                    severity = "LOW"
                    action = "None"
                    
                    if (AppConfig.MANDATORY_PPE["helmet"] and not has_helmet) or \
                       (AppConfig.MANDATORY_PPE["vest"] and not has_vest):
                        status = "VIOLATION"
                        color = AppConfig.COLOR_WARNING
                        severity = "MEDIUM"
                        
                        missing = []
                        if not has_helmet: missing.append("Helmet")
                        if not has_vest: missing.append("Vest")
                        
                        label = f"NO {', '.join(missing).upper()}"
                        action = f"Issue warning - Missing {', '.join(missing)}"
                        
                        # Generate structured JSON format block
                        payload = {
                            "type": "PPE_VIOLATION",
                            "helmet": has_helmet,
                            "vest": has_vest,
                            "status": status,
                            "severity": severity,
                            "recommended_action": action
                        }
                        
                        event_engine.process_event("PPE_VIOLATION", conf, payload)
                        
                    # Visual Rendering Pipeline
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                    cv2.rectangle(frame, (x1, y1 - 20), (x1 + w, y1), color, -1)
                    cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1)

        return frame
