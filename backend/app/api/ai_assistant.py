from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import AIAssistantRequest, AIAssistantResponse
from backend.app.services.ai_assistant_service import AIAssistantService

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/analyze", response_model=AIAssistantResponse)
def analyze_with_ai(request: AIAssistantRequest, db: Session = Depends(get_db)):
    res = AIAssistantService.answer_query(db, request.query)
    return AIAssistantResponse(
        answer=res["answer"],
        matched_candidates=res["matched_candidates"],
        sql_reasoning=res["sql_reasoning"]
    )
