import cv2
import threading
import time
import logging
from ultralytics import YOLO

from config import AppConfig
from event_engine import EnterpriseEventEngine, GLOBAL_FRAMES
from ppe_detection import PPEDetector
from fire_detection import FireDetector
from app import run_flask_app

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] MAIN - %(message)s')

# Global single model instance
central_model = YOLO(AppConfig.YOLO_MODEL_PATH)

def camera_worker(camera_config):
    cam_id = camera_config["id"]
    cam_source = camera_config["source"]
    
    logging.info(f"[{cam_id}] Initializing Edge Node -> {cam_source}")
    
    event_engine = EnterpriseEventEngine(camera_id=cam_id)
    ppe_detector = PPEDetector(camera_id=cam_id)
    fire_detector = FireDetector(camera_id=cam_id)
    
    cap = cv2.VideoCapture(cam_source)
    if not cap.isOpened():
        logging.error(f"[{cam_id}] Source failed.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            if isinstance(cam_source, str) and cam_source.endswith('.mp4'):
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                cap = cv2.VideoCapture(cam_source)
                continue
        
        frame = cv2.resize(frame, (640, 480))
        
        # 1. Run inference
        results = central_model(frame, verbose=False, conf=AppConfig.CONFIDENCE_THRESHOLD)
        
        # 2. Pipeline processing
        frame = ppe_detector.process(frame, results, event_engine)
        frame = fire_detector.process(frame, results, event_engine)
        
        # 3. Synchronize clock events
        event_engine.tick_cleanup()
        
        # Encode webstream
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            GLOBAL_FRAMES[cam_id] = buffer.tobytes()

    cap.release()

def main():
    logging.info("Starting Enterprise Event OS Dashboard Node...")
    
    flask_thread = threading.Thread(
        target=run_flask_app, 
        args=(AppConfig.FLASK_HOST, AppConfig.FLASK_PORT), 
        daemon=True
    )
    flask_thread.start()
    
    camera_threads = []
    for cam_config in AppConfig.CAMERA_SOURCES:
        t = threading.Thread(target=camera_worker, args=(cam_config,), daemon=True)
        t.start()
        camera_threads.append(t)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Shutdown signal received.")

if __name__ == "__main__":
    main()
