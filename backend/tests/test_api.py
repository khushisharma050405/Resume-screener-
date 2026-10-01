import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.main import app
from backend.app.services.nlp_engine import NLPEngine
from backend.app.services.ner_extractor import NERExtractor
from backend.app.services.skill_extractor import SkillExtractor
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.job_matcher import JobMatcher

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_nlp_engine_sections():
    text = "Alex Rivera\nSUMMARY\nExperienced ML Engineer\nEDUCATION\nMS in AI from Stanford\nSKILLS\nPython, PyTorch"
    sections = NLPEngine.classify_sections(text)
    assert "SUMMARY" in sections
    assert "EDUCATION" in sections
    assert "SKILLS" in sections

def test_ner_extractor():
    text = "Alex Rivera is a Senior Machine Learning Engineer at Google with email alex@example.com."
    entities = NERExtractor.extract_entities(text)
    entity_types = [e["type"] for e in entities]
    assert "PERSON" in entity_types
    assert "JOB_TITLE" in entity_types
    assert "EMAIL" in entity_types

def test_skill_extractor():
    text = "Developed production neural networks using PyTorch, Python, SQL, and Docker."
    skills = SkillExtractor.extract_skills(text)
    skill_names = [s["name"] for s in skills]
    assert "Python" in skill_names
    assert "PyTorch" in skill_names
    assert "SQL" in skill_names

def test_embedding_service():
    v1 = EmbeddingService.get_embedding("Machine Learning Engineer")
    v2 = EmbeddingService.get_embedding("Python AI developer")
    sim = EmbeddingService.cosine_similarity(v1, v2)
    assert len(v1) == 384
    assert 0.0 <= sim <= 1.0

def test_job_matcher_formula():
    cand = {
        "summary": "Senior Machine Learning Engineer specializing in Python, PyTorch, NLP, and SQL models.",
        "top_skills": ["Python", "PyTorch", "NLP", "SQL"],
        "years_of_experience": 5.0,
        "education": [{"degree": "Master of Science"}]
    }
    job = {
        "raw_text": "Looking for a Senior NLP Engineer with Python, PyTorch, and NLP experience.",
        "required_skills": ["Python", "PyTorch", "NLP"],
        "preferred_skills": ["Docker", "AWS"],
        "min_experience_years": 3.0,
        "required_education": "Master's degree"
    }
    res = JobMatcher.calculate_match(cand, job)
    assert res["overall_score"] > 70.0
    assert "Python" in res["matched_skills"]
