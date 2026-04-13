import cv2
from config import AppConfig
from validation import FireValidator
from alert_system import AudioAlertManager

class FireDetector:
    def __init__(self, camera_id):
        self.camera_id = camera_id
        self.validator = FireValidator()
        self.audio_alert = AudioAlertManager()

    def process(self, frame, results, event_engine):
        """
        Enterprise hybrid detector.
        Evaluates YOLO bounding boxes and applies strict Visual & Temporal filters.
        """
        frame_area = frame.shape[0] * frame.shape[1]
        
        # 1. PROCESS PRIMARY YOLO FLAME LAYER
        for r in results:
            boxes = r.boxes
            names = r.names
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = names[cls_id].lower() if cls_id in names else ""
                
                # Accept FIRE/FLAME/SMOKE classes AND cell phones showing fire content.
                # NOTE: cell phones are included because a phone *displaying* a fire image/gif
                # is a valid demo scenario. However, the phone MUST also pass all 7 visual
                # validation layers – a blank, black, or static-colored phone screen is rejected.
                is_ai_fire = class_name in AppConfig.FIRE_CLASSES
                is_candidate = is_ai_fire or (class_name == 'cell phone')

                if not is_candidate:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # 2. RUN STRICT 7-LAYER HYBRID VALIDATION
                # Both gates must pass:
                #   passes_visual  → HSV color + luminance + uniformity + edge density
                #                    + shape irregularity + inter-frame flicker
                #   passes_temporal → fire-colored region persists across N frames
                passes_visual, passes_temporal = self.validator.validate_yolo_box(
                    frame, x1, y1, x2, y2
                )

                # CORE DECISION
                # For phones: the SAME strict visual+temporal gate applies.
                # A black screen, a paused still image, a TV bezel, or a watch
                # will fail luminance / uniformity / flicker — and be blocked here.
                fire_detected = passes_visual and passes_temporal

                if not fire_detected:
                    # Visualise blocked false-positives for operator awareness
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (100, 100, 100), 1)
                    cv2.putText(frame, "FILTERED_FP", (x1, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)
                    continue
                
                # 3. PASSED VALIDATION -> ASSESS SEVERITY
                bbox_area = (x2 - x1) * (y2 - y1)
                area_ratio = bbox_area / frame_area
                
                severity_level = "MEDIUM"
                if area_ratio >= AppConfig.FIRE_SEVERITY_THRESHOLDS["HIGH"]:
                    severity_level = "HIGH"
                    
                action = "Initiate emergency response"
                
                # 4. AUDIO TRIGGERS
                # Trigger ONLY when fire is confirmed
                self.audio_alert.trigger_fire_alarm()
                    
                payload = {
                    "type": "FIRE",
                    "severity": severity_level,
                    "confidence": float(round(conf, 2)),
                    "validated": True,
                    "source": "visual_pattern + temporal_detection",
                    "recommended_action": action
                }
                
                event_engine.process_event("FIRE", conf, payload, is_critical=True)
                
                # Rendering Output Frame
                color = AppConfig.COLOR_DANGER
                label = f"FIRE ({severity_level})"
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(frame, (x1, y1 - 25), (x1 + w, y1), color, -1)
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
                
        return frame
