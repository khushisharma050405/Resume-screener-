from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import JobDescription, Candidate, CandidateMatch
from backend.app.schemas.schemas import JobCreate, JobResponse
from backend.app.services.skill_extractor import SkillExtractor
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.job_matcher import JobMatcher

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    req_skills = job_in.required_skills
    if not req_skills:
        extracted = SkillExtractor.extract_skills(job_in.raw_text)
        req_skills = [s["name"] for s in extracted]

    skills_str = " ".join(req_skills)
    job_embedding_text = f"{job_in.title} {job_in.department} {job_in.raw_text} {skills_str}"
    vector_embedding = EmbeddingService.get_embedding(job_embedding_text)

    default_requirements = [
        {"name": s, "type": "Required", "priority": "High", "weight": 15} for s in req_skills[:4]
    ]
    if not default_requirements:
        default_requirements = [
            {"name": "Domain Expertise", "type": "Required", "priority": "High", "weight": 25},
            {"name": "Core Technical Skills", "type": "Required", "priority": "High", "weight": 25}
        ]

    db_job = JobDescription(
        title=job_in.title,
        department=job_in.department or "Engineering",
        location=job_in.location or "Remote",
        raw_text=job_in.raw_text,
        required_skills_json=req_skills,
        preferred_skills_json=job_in.preferred_skills,
        min_experience_years=job_in.min_experience_years,
        required_education=job_in.required_education,
        weight_config_json={"skill": 35, "semantic": 30, "experience": 15, "education": 10, "coverage": 10},
        requirements_json=default_requirements,
        vector_embedding=vector_embedding
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.post("/{job_id}/analyze")
def analyze_job_requirements(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    extracted_skills = SkillExtractor.extract_skills(job.raw_text)
    req_skill_names = [s["name"] for s in extracted_skills]

    requirements = []
    for s in req_skill_names[:5]:
        requirements.append({
            "name": s,
            "type": "Required",
            "priority": "High",
            "weight": 15
        })
    
    requirements.append({
        "name": f"{job.min_experience_years}+ years experience",
        "type": "Required",
        "priority": "High",
        "weight": 15
    })

    if job.required_education:
        requirements.append({
            "name": job.required_education,
            "type": "Required",
            "priority": "Medium",
            "weight": 10
        })

    job.required_skills_json = req_skill_names
    job.requirements_json = requirements
    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "title": job.title,
        "extracted_required_skills": req_skill_names,
        "requirements": requirements,
        "weight_config": job.weight_config_json
    }

@router.post("/{job_id}/screen")
def screen_candidates_for_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    candidates = db.query(Candidate).all()
    job_dict = {
        "id": job.id,
        "title": job.title,
        "raw_text": job.raw_text,
        "required_skills": job.required_skills_json or [],
        "preferred_skills": job.preferred_skills_json or [],
        "min_experience_years": job.min_experience_years,
        "required_education": job.required_education,
        "weight_config": job.weight_config_json,
        "vector_embedding": job.vector_embedding
    }

    match_results = []
    for cand in candidates:
        cand_dict = {
            "id": cand.id,
            "full_name": cand.full_name,
            "summary": cand.summary,
            "years_of_experience": cand.years_of_experience,
            "top_skills": cand.top_skills_json or [],
            "vector_embedding": cand.vector_embedding,
            "education": [{"degree": e.degree} for e in cand.educations]
        }

        res = JobMatcher.calculate_match(cand_dict, job_dict)
        stage = "STRONG_MATCH" if res["overall_score"] >= 85 else "SCREENED"

        existing_match = db.query(CandidateMatch).filter(
            CandidateMatch.candidate_id == cand.id,
            CandidateMatch.job_id == job.id
        ).first()

        if existing_match:
            existing_match.overall_score = res["overall_score"]
            existing_match.skill_match_score = res["skill_match_score"]
            existing_match.semantic_score = res["semantic_score"]
            existing_match.experience_score = res["experience_score"]
            existing_match.education_score = res["education_score"]
            existing_match.required_skill_coverage = res["required_skill_coverage"]
            existing_match.matched_skills_json = res["matched_skills"]
            existing_match.missing_skills_json = res["missing_skills"]
            existing_match.match_reasons_json = res["match_reasons"]
            match_obj = existing_match
        else:
            match_obj = CandidateMatch(
                candidate_id=cand.id,
                job_id=job.id,
                overall_score=res["overall_score"],
                skill_match_score=res["skill_match_score"],
                semantic_score=res["semantic_score"],
                experience_score=res["experience_score"],
                education_score=res["education_score"],
                required_skill_coverage=res["required_skill_coverage"],
                matched_skills_json=res["matched_skills"],
                missing_skills_json=res["missing_skills"],
                match_reasons_json=res["match_reasons"],
                stage=stage
            )
            db.add(match_obj)

        db.commit()
        match_results.append(res)

    return {"job_id": job.id, "candidates_screened": len(match_results), "matches": match_results}

@router.put("/{job_id}")
def update_job(job_id: int, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    if "weight_config" in payload:
        job.weight_config_json = payload["weight_config"]
    if "requirements" in payload:
        job.requirements_json = payload["requirements"]
    if "required_skills" in payload:
        job.required_skills_json = payload["required_skills"]

    db.commit()
    db.refresh(job)
    return job

@router.get("", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    db.delete(job)
    db.commit()
    return {"message": f"Job {job_id} deleted."}
