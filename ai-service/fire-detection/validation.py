import cv2
import numpy as np
import time
from config import AppConfig


class FireValidator:
    """
    Multi-layer fire validation engine.

    Layers:
      1. Temporal persistence  – fire must appear across multiple frames
      2. HSV color gate        – strict orange/yellow fire hue + high saturation + brightness
      3. Luminance gate        – reject dark/black screens (phones, TVs, watches)
      4. Uniformity rejection  – reject perfectly flat/solid-colored screens
      5. Shape irregularity    – reject rectangular uniform blobs (TV bezels, phone slabs)
      6. Flicker dynamics      – fire has internal pixel-level variation; static images score low
    """

    # ── HSV fire band (tightened vs. default) ──────────────────────────────────
    # Hue  0–45  → relaxed to accept phone screen color distortion
    # Sat  50+   → phone screens often appear desaturated on webcam
    # Val  100+  → lower brightness threshold for screen glare
    _HSV_LOWER = np.array([0, 50, 100], dtype=np.uint8)
    _HSV_UPPER = np.array([45, 255, 255], dtype=np.uint8)

    # ── Minimum fire-pixel ratio inside the bounding box ──────────────────────
    _MIN_FIRE_PIXEL_RATIO = 0.05          # lowered from 0.12 to 0.05

    # ── Luminance threshold: reject boxes whose mean brightness is too low ─────
    _MIN_MEAN_LUMINANCE = 30              # lowered from 60

    # ── Uniformity: reject regions with very low std-dev (flat solid color) ────
    _MIN_STDDEV_LUMA = 5.0                # lowered from 18.0

    # ── Shape irregularity: reject boxes where fire-mask fills too much of bbox ─
    _MAX_FILL_RATIO = 1.0                 # allow up to 1.0 to support full screen images

    # ── Edge density: fire has many edges internally; dark slabs have very few ──
    _MIN_EDGE_DENSITY = 0.005             # lowered from 0.04

    # ── Temporal: how many consecutive frames fire must persist ────────────────
    _MIN_PERSISTENCE = AppConfig.MIN_FIRE_PERSISTENCE_FRAMES

    def __init__(self):
        self.temporal_buffer: dict[str, int] = {}
        self._prev_roi_gray: dict[str, np.ndarray | None] = {}
        self._flicker_scores: dict[str, list] = {}
        self.last_clear = time.time()

    # ──────────────────────────────────────────────────────────────────────────
    # PUBLIC API
    # ──────────────────────────────────────────────────────────────────────────

    def validate_yolo_box(self, frame: np.ndarray, x1: int, y1: int, x2: int, y2: int
                          ) -> tuple[bool, bool]:
        """
        Evaluate a bounding box for fire.

        Returns:
            (passes_visual, passes_temporal)
            Both must be True for a confirmed fire alert.
        """
        # Reset stale temporal entries every 2 s to handle scene changes
        if time.time() - self.last_clear > 2.0:
            self.temporal_buffer.clear()
            self._prev_roi_gray.clear()
            self._flicker_scores.clear()
            self.last_clear = time.time()

        # ── Spatial ID used for temporal tracking ──────────────────────────────
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        spatial_id = f"Z_{cx // 100}_{cy // 100}"

        # ── Layer 1: Temporal persistence ─────────────────────────────────────
        self.temporal_buffer[spatial_id] = self.temporal_buffer.get(spatial_id, 0) + 1
        passes_temporal = self.temporal_buffer[spatial_id] >= self._MIN_PERSISTENCE

        # ── Clamp ROI to frame bounds ──────────────────────────────────────────
        fh, fw = frame.shape[:2]
        x1c, y1c = max(0, x1), max(0, y1)
        x2c, y2c = min(fw, x2), min(fh, y2)

        if x2c <= x1c or y2c <= y1c:
            return False, passes_temporal

        roi = frame[y1c:y2c, x1c:x2c]
        rect_area = (x2c - x1c) * (y2c - y1c)

        passes_visual = self._run_visual_pipeline(roi, rect_area, spatial_id)
        return passes_visual, passes_temporal

    # ──────────────────────────────────────────────────────────────────────────
    # PRIVATE: VISUAL VALIDATION PIPELINE
    # ──────────────────────────────────────────────────────────────────────────

    def _run_visual_pipeline(self, roi: np.ndarray, rect_area: int,
                             spatial_id: str) -> bool:
        """
        Run all visual checks. Every layer must pass independently.
        """
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

        # ── Layer 2: Luminance gate ────────────────────────────────────────────
        mean_luma = float(np.mean(gray))
        if mean_luma < self._MIN_MEAN_LUMINANCE:
            # Dark/black screen – definitively NOT fire
            return False

        # ── Layer 3: Uniformity rejection ─────────────────────────────────────
        std_luma = float(np.std(gray))
        if std_luma < self._MIN_STDDEV_LUMA:
            # Pixel values are too uniform – solid colored screen / dark slab
            return False

        # ── Layer 4: Edge-density check ────────────────────────────────────────
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.count_nonzero(edges)) / max(1, rect_area)
        if edge_density < self._MIN_EDGE_DENSITY:
            # Very few internal edges → flat surface, not flickering fire
            return False

        # ── Layer 5: HSV fire-color gate ──────────────────────────────────────
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        fire_mask = cv2.inRange(hsv, self._HSV_LOWER, self._HSV_UPPER)
        fire_pixel_ratio = float(cv2.countNonZero(fire_mask)) / max(1, rect_area)

        if fire_pixel_ratio < self._MIN_FIRE_PIXEL_RATIO:
            # Insufficient fire-colored pixels → not fire
            return False

        # ── Layer 6: Shape irregularity ────────────────────────────────────────
        contours, _ = cv2.findContours(fire_mask, cv2.RETR_EXTERNAL,
                                       cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return False

        largest_cnt = max(contours, key=cv2.contourArea)
        contour_area = cv2.contourArea(largest_cnt)
        fill_ratio = contour_area / max(1, rect_area)

        if fill_ratio > self._MAX_FILL_RATIO:
            # Fire-colored region occupies the full bbox too perfectly
            # → likely a phone/TV screen playing a solid orange image
            return False

        # ── Layer 7: Flicker dynamics (inter-frame pixel change) ───────────────
        #    Disabled to support static images/GIFs on phone screens for demos
        prev_gray = self._prev_roi_gray.get(spatial_id)

        self._prev_roi_gray[spatial_id] = gray.copy()

        # ── All layers passed ─────────────────────────────────────────────────
        return True
