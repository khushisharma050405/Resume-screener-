import os
import sys
from backend.app.services.ner_extractor import NERExtractor
from backend.app.services.skill_extractor import SkillExtractor

def predict_entities(text: str):
    print(f"[Inference] Running NER & Skill extraction on sample text...")
    entities = NERExtractor.extract_entities(text)
    skills = SkillExtractor.extract_skills(text)

    return {
        "entities": entities,
        "skills": skills
    }

if __name__ == "__main__":
    sample_resume = "Alex Rivera is a Senior Machine Learning Engineer at Google in San Francisco. Expert in PyTorch, Python, SQL, and Docker."
    res = predict_entities(sample_resume)
    print("Extracted Entities:", res["entities"])
    print("Extracted Skills:", res["skills"])
