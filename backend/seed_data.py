import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database.connection import SessionLocal, Base, engine
from backend.app.database.models import User, Candidate, Resume, Skill, Education, Experience, Project, Certification, JobDescription, CandidateMatch
from backend.app.api.deps import get_password_hash
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.job_matcher import JobMatcher

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not db.query(User).filter(User.email == "recruiter@resumeiq.ai").first():
        recruiter = User(
            email="recruiter@resumeiq.ai",
            hashed_password=get_password_hash("demo123"),
            full_name="Senior Recruiter (Demo)",
            role="recruiter"
        )
        db.add(recruiter)
        db.commit()

    db.query(CandidateMatch).delete()
    db.query(Skill).delete()
    db.query(Education).delete()
    db.query(Experience).delete()
    db.query(Project).delete()
    db.query(Certification).delete()
    db.query(Resume).delete()
    db.query(Candidate).delete()
    db.query(JobDescription).delete()
    db.commit()

    # 1. Candidate: Alex Rivera (AI/ML Engineer)
    c1_skills = ["Python", "PyTorch", "TensorFlow", "NLP", "LLMs", "Transformers", "Docker", "AWS", "SQL"]
    c1_emb = EmbeddingService.get_embedding("Alex Rivera Machine Learning Engineer PyTorch NLP Transformers LLMs MLOps Docker AWS SQL")
    c1 = Candidate(
        full_name="Alex Rivera",
        email="alex.rivera@example.com",
        phone="+1 (555) 234-5678",
        location="San Francisco, CA",
        summary="Senior Machine Learning Engineer specializing in NLP, Transformer architectures, and scalable MLOps deployment.",
        linkedin_url="https://linkedin.com/in/alex-rivera-ml",
        github_url="https://github.com/arivera-ai",
        years_of_experience=5.0,
        top_skills_json=c1_skills,
        vector_embedding=c1_emb
    )
    db.add(c1)
    db.commit()
    db.refresh(c1)

    db.add(Education(candidate_id=c1.id, degree="Master of Science", field_of_study="Artificial Intelligence", institution="Stanford University", start_year="2017", end_year="2019", cgpa="3.9/4.0"))
    db.add(Experience(candidate_id=c1.id, company="Google AI", role="Senior Machine Learning Engineer", location="Mountain View, CA", start_date="2021-06", end_date="Present", is_current=True, duration_months=36, responsibilities_json=["Engineered LLM fine-tuning pipelines", "Optimized inference latency by 45% using TensorRT"], technologies_json=["PyTorch", "Transformers", "Python", "Kubernetes"]))
    for s in c1_skills:
        db.add(Skill(candidate_id=c1.id, name=s, category="AI/ML" if s in ["PyTorch", "TensorFlow", "NLP", "LLMs", "Transformers"] else "Programming", confidence_score=0.95, source_sentence=f"Developed production ML models using {s}."))

    # 2. Candidate: Dr. Elena Rostova (Senior Data Scientist)
    c2_skills = ["Python", "Scikit-learn", "SQL", "PostgreSQL", "R", "Pandas", "NumPy", "A/B Testing", "Tableau"]
    c2_emb = EmbeddingService.get_embedding("Elena Rostova Senior Data Scientist Machine Learning Statistical Modeling Scikit-learn SQL Pandas")
    c2 = Candidate(
        full_name="Dr. Elena Rostova",
        email="elena.rostova@example.com",
        phone="+1 (555) 876-5432",
        location="Boston, MA",
        summary="Senior Data Scientist with a PhD in Applied Statistics and 6 years of industry experience building predictive models and causal inference pipelines.",
        linkedin_url="https://linkedin.com/in/elena-rostova-ds",
        github_url="https://github.com/erostova-stats",
        years_of_experience=6.0,
        top_skills_json=c2_skills,
        vector_embedding=c2_emb
    )
    db.add(c2)
    db.commit()
    db.refresh(c2)

    db.add(Education(candidate_id=c2.id, degree="Ph.D.", field_of_study="Applied Statistics", institution="MIT", start_year="2014", end_year="2018", cgpa="4.0"))
    db.add(Experience(candidate_id=c2.id, company="BioTech Analytics", role="Lead Data Scientist", location="Boston, MA", start_date="2020-03", end_date="Present", is_current=True, duration_months=52, responsibilities_json=["Led statistical modeling for clinical trials"], technologies_json=["Python", "Scikit-learn", "SQL", "Tableau"]))
    for s in c2_skills:
        db.add(Skill(candidate_id=c2.id, name=s, category="Analytics & Data Science", confidence_score=0.92, source_sentence=f"Applied statistical modeling using {s}."))

    # 3. Candidate: Sarah Jenkins (Marketing Manager)
    c3_skills = ["Digital Marketing", "SEO", "Content Strategy", "Google Analytics", "Brand Management", "Social Media", "Email Campaigns"]
    c3_emb = EmbeddingService.get_embedding("Sarah Jenkins Marketing Manager Digital Marketing SEO Content Strategy Brand Management Google Analytics")
    c3 = Candidate(
        full_name="Sarah Jenkins",
        email="sarah.jenkins@example.com",
        phone="+1 (555) 456-7890",
        location="New York, NY",
        summary="Strategic Marketing Manager with 4+ years driving multi-channel digital campaigns, SEO growth, and customer acquisition.",
        linkedin_url="https://linkedin.com/in/sarah-jenkins-mktg",
        years_of_experience=4.5,
        top_skills_json=c3_skills,
        vector_embedding=c3_emb
    )
    db.add(c3)
    db.commit()
    db.refresh(c3)

    db.add(Education(candidate_id=c3.id, degree="Bachelor of Arts", field_of_study="Communications & Marketing", institution="NYU", start_year="2016", end_year="2020", cgpa="3.7"))
    db.add(Experience(candidate_id=c3.id, company="GrowthMedia", role="Senior Marketing Manager", location="New York, NY", start_date="2021-01", end_date="Present", is_current=True, duration_months=40, responsibilities_json=["Scaled user acquisition campaigns by 140%"], technologies_json=["SEO", "Google Analytics", "HubSpot"]))
    for s in c3_skills:
        db.add(Skill(candidate_id=c3.id, name=s, category="Marketing", confidence_score=0.91, source_sentence=f"Managed campaign analytics and strategy using {s}."))

    # 4. Candidate: Marcus Vance (Full-Stack Software Engineer)
    c4_skills = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker"]
    c4_emb = EmbeddingService.get_embedding("Marcus Vance Full Stack Developer React Next.js Node.js Python FastAPI PostgreSQL Docker")
    c4 = Candidate(
        full_name="Marcus Vance",
        email="marcus.vance@example.com",
        phone="+1 (555) 345-6789",
        location="Austin, TX",
        summary="Full-Stack Engineer building high-throughput web applications with Next.js, FastAPI, and cloud microservices.",
        linkedin_url="https://linkedin.com/in/marcus-vance-dev",
        years_of_experience=4.0,
        top_skills_json=c4_skills,
        vector_embedding=c4_emb
    )
    db.add(c4)
    db.commit()
    db.refresh(c4)

    db.add(Education(candidate_id=c4.id, degree="Bachelor of Science", field_of_study="Computer Science", institution="UT Austin", start_year="2016", end_year="2020", cgpa="3.8"))
    db.add(Experience(candidate_id=c4.id, company="CloudScale Systems", role="Senior Full Stack Engineer", location="Austin, TX", start_date="2020-07", end_date="Present", is_current=True, duration_months=48, responsibilities_json=["Architected SaaS dashboard using Next.js and FastAPI"], technologies_json=["React", "Next.js", "Python", "FastAPI"]))
    for s in c4_skills:
        db.add(Skill(candidate_id=c4.id, name=s, category="Frameworks & Libraries", confidence_score=0.90, source_sentence=f"Developed applications using {s}."))

    db.commit()

    # 5. Create Job Descriptions across diverse domains
    jobs_list = [
        {
            "title": "Senior NLP Engineer",
            "department": "AI Research & Engineering",
            "location": "Remote / San Francisco, CA",
            "text": "Seeking an experienced NLP Engineer to lead text extraction, Named Entity Recognition (NER), and transformer models. Requirements: 3+ years experience with Python, PyTorch, Transformers, spaCy, FastAPI, Docker, and SQL.",
            "skills": ["Python", "PyTorch", "NLP", "Transformers", "FastAPI", "Docker", "SQL"],
            "pref": ["AWS", "LLMs", "Pinecone"],
            "exp": 3.0,
            "edu": "Master's or Bachelor's in CS / AI"
        },
        {
            "title": "Senior Data Analyst",
            "department": "Data Intelligence",
            "location": "Boston, MA / Hybrid",
            "text": "Seeking a Data Analyst to build dashboards, statistical reports, and customer insights. Requirements: 3+ years experience with SQL, Power BI, Excel, Python, Tableau, and A/B Testing.",
            "skills": ["SQL", "Power BI", "Excel", "Python", "Tableau", "A/B Testing"],
            "pref": ["PostgreSQL", "R", "Snowflake"],
            "exp": 3.0,
            "edu": "Bachelor's degree in Quantitative field"
        },
        {
            "title": "Digital Marketing Manager",
            "department": "Brand & Growth Marketing",
            "location": "New York, NY / Remote",
            "text": "We are hiring a Digital Marketing Manager to lead paid search, SEO strategy, social media campaigns, and brand growth. Required skills: Digital Marketing, SEO, Content Strategy, Google Analytics, Brand Management, and Social Media.",
            "skills": ["Digital Marketing", "SEO", "Content Strategy", "Google Analytics", "Brand Management"],
            "pref": ["HubSpot", "Email Campaigns", "Copywriting"],
            "exp": 4.0,
            "edu": "Bachelor's in Marketing, Communications or Business"
        }
    ]

    for j_data in jobs_list:
        j_emb = EmbeddingService.get_embedding(f"{j_data['title']} {j_data['department']} {j_data['text']}")
        j_obj = JobDescription(
            title=j_data["title"],
            department=j_data["department"],
            location=j_data["location"],
            raw_text=j_data["text"],
            required_skills_json=j_data["skills"],
            preferred_skills_json=j_data["pref"],
            min_experience_years=j_data["exp"],
            required_education=j_data["edu"],
            weight_config_json={"skill": 35, "semantic": 30, "experience": 15, "education": 10, "coverage": 10},
            requirements_json=[{"name": s, "type": "Required", "priority": "High", "weight": 15} for s in j_data["skills"][:4]],
            vector_embedding=j_emb
        )
        db.add(j_obj)
        db.commit()
        db.refresh(j_obj)

        # Precompute match scores across candidates
        for c in [c1, c2, c3, c4]:
            cand_dict = {
                "id": c.id,
                "full_name": c.full_name,
                "summary": c.summary,
                "years_of_experience": c.years_of_experience,
                "top_skills": c.top_skills_json or [],
                "vector_embedding": c.vector_embedding,
                "education": [{"degree": e.degree} for e in c.educations]
            }
            job_dict = {
                "id": j_obj.id,
                "title": j_obj.title,
                "raw_text": j_obj.raw_text,
                "required_skills": j_obj.required_skills_json,
                "preferred_skills": j_obj.preferred_skills_json,
                "min_experience_years": j_obj.min_experience_years,
                "required_education": j_obj.required_education,
                "weight_config": j_obj.weight_config_json,
                "vector_embedding": j_obj.vector_embedding
            }
            m_res = JobMatcher.calculate_match(cand_dict, job_dict)
            stage = "STRONG_MATCH" if m_res["overall_score"] >= 80 else ("SCREENED" if m_res["overall_score"] >= 60 else "ALL")

            db.add(CandidateMatch(
                candidate_id=c.id,
                job_id=j_obj.id,
                overall_score=m_res["overall_score"],
                skill_match_score=m_res["skill_match_score"],
                semantic_score=m_res["semantic_score"],
                experience_score=m_res["experience_score"],
                education_score=m_res["education_score"],
                required_skill_coverage=m_res["required_skill_coverage"],
                matched_skills_json=m_res["matched_skills"],
                missing_skills_json=m_res["missing_skills"],
                match_reasons_json=m_res["match_reasons"],
                stage=stage
            ))
            db.commit()

    print("[Seed Data] Job-Agnostic Database Seed Completed Successfully!")
    db.close()

if __name__ == "__main__":
    seed()
