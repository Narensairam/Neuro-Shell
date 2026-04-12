import numpy as np

from src.preprocess import clean_text
from src.similarity_engine import SimilarityEngine


class TicketAgent:
    def __init__(self, threshold=0.5):
        self.engine = SimilarityEngine()
        self.threshold = threshold
        self.knowledge_base = []
        self.texts = []

    def train(self, texts, resolutions):
        self.texts = texts
        self.engine.fit(texts)
        self.knowledge_base = resolutions

    def handle_ticket(self, text):
        text = clean_text(text)
        scores = self.engine.find_similar(text)
        top_indices = np.argsort(scores)[-3:][::-1]
        best_idx = int(top_indices[0])
        best_score = scores[best_idx]

        if best_score >= self.threshold:
            return {
                "status": "Deflected",
                "solution": self.knowledge_base[best_idx],
                "confidence": float(best_score),
                "matched_issue": self.texts.iloc[best_idx],
            }
        return {
            "status": "Escalated",
            "message": "No strong match found",
            "confidence": float(best_score),
            "suggestions": [self.texts.iloc[i] for i in top_indices],
        }
