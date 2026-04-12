from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SimilarityEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.kb_vectors = None
        self.kb_texts = None

    def fit(self, texts):
        self.kb_texts = texts
        self.kb_vectors = self.vectorizer.fit_transform(texts)

    def find_similar(self, query):
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.kb_vectors)
        return similarities.flatten()
