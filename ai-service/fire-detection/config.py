import numpy as np

# ==========================================
# ENTERPRISE AI OS (EOS) - CONFIGURATION V3
# ==========================================

class AppConfig:
    # --- CAMERA & VIDEO SOURCES ---
    CAMERA_SOURCES = [
        {"id": "CAM_01", "name": "Refinery Zone A", "source": 0}, 
        # {"id": "CAM_02", "name": "Pump Station 5", "source": 1}
    ]
    
    # --- MODEL CONFIGURATION ---
    YOLO_MODEL_PATH = "yolov8n.pt"  
    CONFIDENCE_THRESHOLD = 0.50
    NMS_THRESHOLD = 0.40

    # --- PPE COMPLIANCE SIMULATION ---
    # In a prod environment with custom weights, these point to discrete classes (e.g., Helmet=0, Vest=1)
    # Since we are using standard COCO, we trigger compliance heuristics on PERSON.
    PERSON_CLASS_ID = 0
    
    MANDATORY_PPE = {
        "helmet": True,
        "vest": True,
        "goggles": False,
        "gloves": False
    }

    # --- FIRE SIMULATION & SEVERITY ---
    # Dynamic text matching against YOLO COCO or Custom classes
    FIRE_CLASSES = ['fire', 'flame', 'smoke']
    
    FIRE_SEVERITY_THRESHOLDS = {
        # Thresholds based on fractional area of bounding box relative to frame area
        "MEDIUM": 0.05,
        "HIGH": 0.15
    }
    
    FIRE_FINANCIAL_IMPACT = {
        "MEDIUM": "$350k (Local System Fire)",
        "HIGH": "$2.3M (Cascade Structural Risk)"
    }
    
    # --- HSV MASKS FOR FIRE & SPARK CONFIG ---
    FIRE_HSV_LOWER = np.array([10, 100, 200], dtype=np.uint8)  
    FIRE_HSV_UPPER = np.array([35, 255, 255], dtype=np.uint8) 
    
    MIN_FIRE_PERSISTENCE_FRAMES = 3 
    AUDIO_ALERT_COOLDOWN_SEC = 15  
    
    # --- RESTRICTED ZONES ---
    RESTRICTED_ZONES = {
        "CAM_01": np.array([[150, 480], [490, 480], [400, 200], [240, 200]], np.int32)
    }

    # --- SERVER ENDPOINTS ---
    FLASK_HOST = "0.0.0.0"
    FLASK_PORT = 5002
    
    # --- EVENT ENGINE LIMITS ---
    ALERT_DEBOUNCE_FRAMES = 5 
    MAX_ALERTS_HISTORY = 50
    
    # --- COLORS ---
    COLOR_SAFE = (0, 200, 0)
    COLOR_WARNING = (0, 165, 255)
    COLOR_DANGER = (0, 0, 255)
    COLOR_INFO = (255, 100, 0)
    COLOR_OVERLAY = (50, 50, 50)
