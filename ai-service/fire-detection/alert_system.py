import threading
import time
import winsound
import logging
from config import AppConfig

class AudioAlertManager:
    """
    Enterprise klaxon interface using OS-level low-frequency pulses.
    Thread safe and strictly debounced.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self.last_played = 0
        self.sequences_played = 0
        
    def trigger_fire_alarm(self):
        """
        Attempts to trigger the auditory alarm. Will silent-fail if cooldown is active.
        """
        with self._lock:
            if self.sequences_played >= 1:
                return False
            now = time.time()
            if now - self.last_played >= AppConfig.AUDIO_ALERT_COOLDOWN_SEC:
                self.last_played = now
                self.sequences_played += 1
                # Fire and forget in a background thread so CV processing does not block
                t = threading.Thread(target=self._play_klaxon_sequence, daemon=True)
                t.start()
                return True
            return False

    def _play_klaxon_sequence(self):
        """
        Low-frequency industrial warning tone.
        """
        logging.warning("[AUDIO ALERT] FIRE ALARM KLAXON ACTIVATED!")
        try:
            # Deep industrial horn pattern
            for _ in range(3):
                winsound.Beep(400, 800)
                time.sleep(0.1)
                winsound.Beep(250, 1000)
                time.sleep(0.2)
        except Exception as e:
            logging.error(f"Failed to play klaxon: {e}")
