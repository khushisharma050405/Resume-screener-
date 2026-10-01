from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import ProcessingLog, Resume

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
def get_history(db: Session = Depends(get_db)):
    resumes = db.query(Resume).order_by(Resume.uploaded_at.desc()).all()
    history_items = []
    
    for r in resumes:
        cand_name = r.candidate.full_name if r.candidate else "Unassigned"
        match_count = len(r.candidate.matches) if (r.candidate and r.candidate.matches) else 0
        top_score = max([m.overall_score for m in r.candidate.matches], default=None) if (r.candidate and r.candidate.matches) else None
        
        history_items.append({
            "id": r.id,
            "filename": r.filename,
            "candidate_name": cand_name,
            "candidate_id": r.candidate_id,
            "uploaded_at": r.uploaded_at,
            "processing_status": r.processing_status,
            "matches_count": match_count,
            "top_match_score": top_score
        })
        
    return history_items
