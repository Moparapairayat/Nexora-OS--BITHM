from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

logger = logging.getLogger("nexora-ml-nlp")


class TextPayload(BaseModel):
    text: str = Field(default="", description="Academic text to analyze")
    sources: list[str] = Field(default_factory=list)


class SimilarityPayload(BaseModel):
    query: str = Field(default="", description="Text to compare against each candidate")
    candidates: list[str] = Field(default_factory=list, description="Texts to score against the query")


app = FastAPI(
    title="Nexora ML/NLP Service",
    description="Real sentence-embedding semantic similarity, plus mock-first plagiarism/writing-risk endpoints.",
    version="0.2.0",
)

# Loaded lazily on first /similarity or /embed call, then cached for the life
# of the process. Loading eagerly at import time would slow down /health and
# every other endpoint during the (one-time, ~seconds-to-a-minute) model
# download/warm-up.
_embedding_model: Any = None


def get_embedding_model() -> Any:
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer

        logger.info("Loading sentence-transformer model (first call only)...")
        _embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _embedding_model


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "nexora-ml-nlp",
        "mode": "mock+embeddings",
        "embeddingModelLoaded": _embedding_model is not None,
    }


@app.post("/similarity")
def semantic_similarity(payload: SimilarityPayload) -> dict[str, Any]:
    """
    Real semantic similarity via sentence embeddings — catches paraphrased
    content that shares no vocabulary with the query, which pure word/n-gram
    overlap (the Node-side Jaccard/cosine checks) cannot detect.
    """
    candidates = [c for c in payload.candidates]

    if not payload.query.strip() or not candidates:
        return {"scores": [0.0 for _ in candidates], "modelUsed": "sentence-transformers/all-MiniLM-L6-v2"}

    try:
        model = get_embedding_model()
        texts = [payload.query] + candidates
        embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        query_vec = embeddings[0]
        scores = [float(query_vec @ candidate_vec) for candidate_vec in embeddings[1:]]
        # Normalized embeddings give cosine similarity in [-1, 1]; clamp to
        # [0, 1] since negative "similarity" isn't meaningful for this use.
        scores = [max(0.0, min(1.0, s)) for s in scores]
        return {"scores": scores, "modelUsed": "sentence-transformers/all-MiniLM-L6-v2"}
    except Exception as exc:  # noqa: BLE001 - report failure, never crash the caller's request
        logger.exception("Embedding similarity failed")
        return {"scores": [0.0 for _ in candidates], "error": str(exc)}


@app.post("/plagiarism/check")
def plagiarism_check(payload: TextPayload) -> dict[str, Any]:
    token_count = len(payload.text.split())
    estimated_overlap = min(34, max(8, token_count // 45))
    fuzzy_score = min(42, estimated_overlap + 5)
    semantic_score = min(48, estimated_overlap + 11)
    internal_score = min(32, max(6, estimated_overlap - 3))
    return {
        "originalityScore": 100 - estimated_overlap,
        "overallSimilarity": estimated_overlap,
        "internalSimilarity": internal_score,
        "fuzzySimilarity": fuzzy_score,
        "semanticSimilarity": semantic_score,
        "riskLevel": "MEDIUM" if estimated_overlap >= 18 else "LOW",
        "sourceRanking": [
            {
                "rank": 1,
                "title": "OTHM Web and Mobile Applications Task 1 Archive",
                "url": "internal-demo://othm-task-1",
                "similarity": round(estimated_overlap / 100, 2),
                "fuzzyScore": round(fuzzy_score / 100, 2),
                "semanticScore": round(semantic_score / 100, 2),
                "internalOverlap": round(internal_score / 100, 2),
                "citationStatus": "missing",
            }
        ],
        "highlightedMatches": [
            {
                "paragraph": 3,
                "excerpt": payload.text[:180],
                "severity": "MEDIUM" if estimated_overlap >= 18 else "LOW",
                "reason": "Mock internal, fuzzy and semantic overlap detected.",
            }
        ],
    }


@app.post("/writing/ai-risk")
def writing_risk(payload: TextPayload) -> dict[str, Any]:
    sentences = [item for item in payload.text.replace("?", ".").split(".") if item.strip()]
    average_sentence_length = (
        sum(len(sentence.split()) for sentence in sentences) / max(len(sentences), 1)
    )
    score = min(78, max(22, int(average_sentence_length * 3)))
    return {
        "riskScore": score,
        "riskLevel": "HIGH" if score >= 70 else "MEDIUM" if score >= 45 else "LOW",
        "confidence": "advisory",
        "features": {
            "averageSentenceLength": round(average_sentence_length, 2),
            "sentenceVariation": "mock-calculated",
            "vocabularyDiversity": "mock-calculated",
        },
        "disclaimer": "This AI writing risk score is advisory and should not be used as final proof of academic misconduct.",
    }
