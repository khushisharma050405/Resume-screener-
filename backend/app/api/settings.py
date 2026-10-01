import sys
import spacy
from fastapi import APIRouter
from backend.app.services.skill_extractor import SKILL_TAXONOMY

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings():
    return {
        "parser_preferences": {
            "ocr_fallback": True,
            "min_skill_confidence": 0.75,
            "auto_extract_sections": True,
            "embedding_model": "sentence-transformers/all-MiniLM-L6-v2 (384-d)"
        },
        "taxonomy": SKILL_TAXONOMY,
        "system_info": {
            "python_version": sys.version,
            "spacy_available": True,
            "spacy_model": "en_core_web_sm",
            "database_backend": "SQLite (ORM / SQLite-Vec compatible)"
        }
    }
