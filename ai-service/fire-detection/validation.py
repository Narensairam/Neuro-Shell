import cv2
import numpy as np
import time
from config import AppConfig

class FireValidator:
    """
    Secondary inspection layer that cross-references AI predictions 
    with dynamic CV heuristics (HSV Color + Spatial Buffers + Sparks).
    """
    def __init__(self):
        self.temporal_buffer = {} # tracks frame counts for spatial hashes
        self.last_clear = time.time()
    
    def validate_yolo_box(self, frame, x1, y1, x2, y2):
        """
        Evaluates a bounding box output by YOLO for both visual and temporal validity.
        """
        if time.time() - self.last_clear > 2.0:
            self.temporal_buffer.clear()
            self.last_clear = time.time()

        # 1. Temporal validation (Fire must persist across multiple frames - handles flicker/movement)
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        spatial_id = f"Z_{cx // 100}_{cy // 100}"
        
        self.temporal_buffer[spatial_id] = self.temporal_buffer.get(spatial_id, 0) + 1
        passes_temporal = self.temporal_buffer[spatial_id] >= AppConfig.MIN_FIRE_PERSISTENCE_FRAMES
        
        # 2. Extract bounding box slice for HSV test
        fh, fw = frame.shape[:2]
        slice_x1, slice_y1 = max(0, x1), max(0, y1)
        slice_x2, slice_y2 = min(fw, x2), min(fh, y2)
        
        if slice_x2 <= slice_x1 or slice_y2 <= slice_y1:
            return False, passes_temporal
            
        roi = frame[slice_y1:slice_y2, slice_x1:slice_x2]
        rect_area = (slice_x2 - slice_x1) * (slice_y2 - slice_y1)
        
        # 3. Visual Validation (HSV Color + Irregular Shape Filter)
        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv_roi, AppConfig.FIRE_HSV_LOWER, AppConfig.FIRE_HSV_UPPER)
        
        fire_pixel_ratio = cv2.countNonZero(mask) / max(1, rect_area)
        passes_color = fire_pixel_ratio > 0.05
        
        passes_shape = False
        if passes_color:
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_cnt = max(contours, key=cv2.contourArea)
                contour_area = cv2.contourArea(largest_cnt)
                # Irregular shape check: Reject perfectly rectangular bright blocks (like non-fire phone screens)
                if contour_area / max(1, rect_area) < 0.8:
                    passes_shape = True
                    
        return (passes_color and passes_shape), passes_temporal
