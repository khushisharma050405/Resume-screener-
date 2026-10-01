from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import Candidate
from backend.app.schemas.schemas import SearchQuery
from backend.app.services.embedding_service import EmbeddingService

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("")
def search_candidates(query_in: SearchQuery, db: Session = Depends(get_db)):
    query = query_in.query.lower().strip()
    candidates = db.query(Candidate).all()
    
    if not query:
        return [
            {
                "id": c.id,
                "full_name": c.full_name,
                "role": c.experiences[0].role if c.experiences else "Candidate",
                "skills": c.top_skills_json or [],
                "years_of_experience": c.years_of_experience,
                "match_score": 100.0
            }
            for c in candidates
        ]

    query_vec = EmbeddingService.get_embedding(query)
    results = []

    for c in candidates:
        cand_skills = [s.lower() for s in (c.top_skills_json or [])]
        cand_text = f"{c.full_name} {c.summary} {' '.join(cand_skills)}"
        cand_vec = c.vector_embedding or EmbeddingService.get_embedding(cand_text)

        sim = EmbeddingService.cosine_similarity(query_vec, cand_vec)

        # Direct skill term match bonus
        hits = [s for s in cand_skills if s in query]
        score = min(99.0, (sim * 0.7 + len(hits) * 0.15 + 0.25) * 100)

        if score >= query_in.min_score:
            results.append({
                "id": c.id,
                "full_name": c.full_name,
                "role": c.experiences[0].role if c.experiences else "Candidate",
                "skills": c.top_skills_json or [],
                "years_of_experience": c.years_of_experience,
                "match_score": round(score, 1)
            })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
