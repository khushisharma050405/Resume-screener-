import re
from typing import List, Dict, Any
from backend.app.services.nlp_engine import NLPEngine

SKILL_TAXONOMY = {
    "Programming": [
        "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "R", "SQL", "Go", "Golang",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "HTML", "CSS", "Bash", "Shell"
    ],
    "AI/ML": [
        "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing", "Computer Vision",
        "Generative AI", "LLMs", "Large Language Models", "Transformers", "BERT", "GPT",
        "Reinforcement Learning", "MLOps", "Feature Engineering", "Neural Networks",
        "Supervised Learning", "Unsupervised Learning", "Prompt Engineering", "RAG"
    ],
    "Frameworks & Libraries": [
        "PyTorch", "TensorFlow", "Scikit-learn", "sklearn", "Keras", "HuggingFace", "OpenCV",
        "React", "Next.js", "FastAPI", "Django", "Flask", "Node.js", "Express.js", "Spring Boot",
        "Vue.js", "Angular", "Tailwind CSS", "Redux", "GraphQL", "REST API"
    ],
    "Databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "Elasticsearch",
        "Pinecone", "ChromaDB", "Qdrant", "Neo4j", "Oracle", "DynamoDB", "Snowflake"
    ],
    "Cloud & DevOps": [
        "AWS", "Azure", "GCP", "Google Cloud Platform", "Docker", "Kubernetes", "Terraform",
        "GitHub Actions", "Jenkins", "Git", "CI/CD", "Linux", "Nginx", "Serverless"
    ],
    "Analytics & Data Science": [
        "Power BI", "Tableau", "Excel", "Pandas", "NumPy", "Matplotlib", "Seaborn",
        "Apache Spark", "Spark", "Databricks", "Hadoop", "ETL", "Data Warehousing", "A/B Testing"
    ]
}

class SkillExtractor:
    """Hybrid skill extraction using taxonomy matching, NLP sentence context, and confidence estimation."""

    @staticmethod
    def extract_skills(raw_text: str) -> List[Dict[str, Any]]:
        sentences = NLPEngine.segment_sentences(raw_text)
        detected_skills = []
        seen_skills = set()

        for category, skill_list in SKILL_TAXONOMY.items():
            for skill in skill_list:
                # Prepare regex for exact word boundary match
                pattern = r"(?i)\b" + re.escape(skill) + r"\b"
                
                for sent in sentences:
                    match = re.search(pattern, sent)
                    if match:
                        skill_key = skill.lower()
                        if skill_key not in seen_skills:
                            seen_skills.add(skill_key)
                            
                            # Calculate confidence score
                            # Base confidence: 0.85; boosted if skill appears in SKILLS section or with action verbs
                            confidence = 0.85
                            if any(word in sent.lower() for word in ["developed", "built", "implemented", "engineered", "expert", "proficient", "using"]):
                                confidence = 0.95
                            
                            detected_skills.append({
                                "name": skill,
                                "category": category,
                                "confidence_score": round(confidence, 2),
                                "source_sentence": sent
                            })
                        break  # move to next skill once detected

        return detected_skills
