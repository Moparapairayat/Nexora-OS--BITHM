from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field


class TextPayload(BaseModel):
    text: str = Field(default="", description="Academic text to analyze")
    sources: list[str] = Field(default_factory=list)


app = FastAPI(
    title="Nexora ML/NLP Service",
    description="Mock-first FastAPI service for plagiarism, writing risk and ML experiments.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "nexora-ml-nlp", "mode": "mock"}


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
