from fastapi import APIRouter
from backend.app.schemas.schemas import ModelEvaluationReport
from backend.app.services.model_evaluator import evaluate_ner_model

router = APIRouter(prefix="/evaluation", tags=["Model Evaluation"])

@router.get("", response_model=ModelEvaluationReport)
def get_model_evaluation():
    report = evaluate_ner_model()
    return report
