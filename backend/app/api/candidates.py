import os
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import Candidate, JobDescription, Resume, Skill, Education, Experience, Project, Certification, CandidateMatch, ProcessingLog
from backend.app.schemas.schemas import CandidateResponse
from backend.app.services.exporter import Exporter
from backend.app.services.job_matcher import JobMatcher

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
def list_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).order_by(Candidate.created_at.desc()).all()
    return candidates

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return cand

@router.get("/{candidate_id}/suitability")
def get_candidate_job_suitability(candidate_id: int, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    jobs = db.query(JobDescription).all()

    cand_dict = {
        "id": cand.id,
        "full_name": cand.full_name,
        "summary": cand.summary,
        "years_of_experience": cand.years_of_experience,
        "top_skills": cand.top_skills_json or [],
        "vector_embedding": cand.vector_embedding,
        "education": [{"degree": e.degree} for e in cand.educations]
    }

    # Calculate ATS Parse & Formatting Health Score (0-100)
    ats_score = 0
    ats_checks = []
    ats_improvement_tips = []

    # 1. Contact info check
    if cand.email:
        ats_score += 15
        ats_checks.append({"item": "Contact Email Present", "passed": True, "score": 15, "category": "Contact"})
    else:
        ats_checks.append({"item": "Contact Email Present", "passed": False, "score": 0, "category": "Contact"})
        ats_improvement_tips.append("Add a direct professional contact email in your resume header.")

    if cand.phone:
        ats_score += 10
        ats_checks.append({"item": "Phone Number Detected", "passed": True, "score": 10, "category": "Contact"})
    else:
        ats_checks.append({"item": "Phone Number Detected", "passed": False, "score": 0, "category": "Contact"})
        ats_improvement_tips.append("Include a standard telephone/mobile number for recruiter outreach.")

    if cand.location:
        ats_score += 10
        ats_checks.append({"item": "Location / Geographic Anchor", "passed": True, "score": 10, "category": "Contact"})
    else:
        ats_checks.append({"item": "Location / Geographic Anchor", "passed": False, "score": 0, "category": "Contact"})

    # 2. Summary
    if cand.summary and len(cand.summary) > 30:
        ats_score += 15
        ats_checks.append({"item": "Executive Professional Summary", "passed": True, "score": 15, "category": "Structure"})
    else:
        ats_checks.append({"item": "Executive Professional Summary", "passed": False, "score": 0, "category": "Structure"})
        ats_improvement_tips.append("Add a 2-3 sentence executive professional summary highlighting core expertise.")

    # 3. Skills taxonomy
    skills_count = len(cand.top_skills_json or [])
    if skills_count >= 6:
        ats_score += 20
        ats_checks.append({"item": f"Extractable Skills Taxonomy ({skills_count} skills detected)", "passed": True, "score": 20, "category": "Keywords"})
    elif skills_count >= 3:
        ats_score += 12
        ats_checks.append({"item": f"Extractable Skills Taxonomy ({skills_count} skills detected)", "passed": True, "score": 12, "category": "Keywords"})
        ats_improvement_tips.append("Expand your skills section with 4+ additional domain-specific tools and methodologies.")
    else:
        ats_checks.append({"item": "Extractable Skills Taxonomy (Under 3 skills)", "passed": False, "score": 0, "category": "Keywords"})
        ats_improvement_tips.append("Create a dedicated 'Skills' section listing industry technologies and keywords.")

    # 4. Experience timeline
    if cand.years_of_experience and cand.years_of_experience > 0:
        ats_score += 15
        ats_checks.append({"item": f"Quantifiable Experience Timeline ({cand.years_of_experience} yrs)", "passed": True, "score": 15, "category": "Experience"})
    else:
        ats_checks.append({"item": "Quantifiable Experience Timeline", "passed": False, "score": 0, "category": "Experience"})
        ats_improvement_tips.append("Ensure job dates and role durations are explicitly formatted with month and year.")

    # 5. Education & Credentials
    if cand.educations and len(cand.educations) > 0:
        ats_score += 15
        ats_checks.append({"item": f"Education Credentials ({cand.educations[0].degree or 'Degree'})", "passed": True, "score": 15, "category": "Education"})
    else:
        ats_checks.append({"item": "Education Credentials Missing", "passed": False, "score": 0, "category": "Education"})
        ats_improvement_tips.append("Add your highest educational degree, institution, and graduation year.")

    ats_score = min(100, max(0, ats_score))

    # Evaluate Candidate suitability for EVERY job in the system
    suitability_results = []
    for job in jobs:
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

        res = JobMatcher.calculate_match(cand_dict, job_dict)
        suitability_level = "HIGHLY_SUITABLE" if res["overall_score"] >= 80 else ("MODERATELY_SUITABLE" if res["overall_score"] >= 60 else "LOW_SUITABILITY")

        # Concrete suggestions on what all the candidate can add to be suitable for this job
        missing_skills = res["missing_skills"]
        critical_missing = missing_skills[:5] if missing_skills else ["Advanced Domain Workflows", "Project KPI Metrics", "Executive Presentation"]
        
        job_suggestions = {
            "critical_missing_skills": critical_missing,
            "recommended_bullet_points": [
                f"Add a quantified bullet demonstrating experience with {critical_missing[0]} (e.g. 'Utilized {critical_missing[0]} to streamline workflows, delivering 25% faster turnaround time').",
                f"Highlight cross-functional collaboration and leadership accomplishments relevant to {job.title}.",
                f"Integrate key terminology from the {job.title} job criteria into your professional headline and experience bullets."
            ],
            "ats_keywords_to_add": critical_missing + [s for s in (job.preferred_skills_json or []) if s not in res["matched_skills"]][:3],
            "recommended_certifications": [
                f"Recognized credential in {job.title.split()[0]} or certified practitioner program",
                "Agile / Project Leadership Specialization"
            ]
        }

        suitability_results.append({
            "job_id": job.id,
            "job_title": job.title,
            "department": job.department,
            "location": job.location,
            "overall_match_score": res["overall_score"],
            "skill_match_score": res["skill_match_score"],
            "semantic_score": res["semantic_score"],
            "experience_score": res["experience_score"],
            "education_score": res["education_score"],
            "suitability_level": suitability_level,
            "matched_skills": res["matched_skills"],
            "missing_skills": res["missing_skills"],
            "match_reasons": res["match_reasons"],
            "suggestions": job_suggestions
        })

    suitability_results.sort(key=lambda x: x["overall_match_score"], reverse=True)

    return {
        "candidate_id": cand.id,
        "candidate_name": cand.full_name,
        "candidate_role": cand.summary.split('.')[0] if cand.summary else 'Professional',
        "ats_score": ats_score,
        "ats_checks": ats_checks,
        "ats_improvement_tips": ats_improvement_tips,
        "total_jobs_scanned": len(jobs),
        "suitable_jobs": suitability_results
    }

@router.get("/{candidate_id}/export")
def export_candidate(candidate_id: int, format: str = "json", db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    cand_dict = {
        "id": cand.id,
        "full_name": cand.full_name,
        "email": cand.email,
        "phone": cand.phone,
        "location": cand.location,
        "summary": cand.summary,
        "years_of_experience": cand.years_of_experience,
        "top_skills": cand.top_skills_json,
        "skills": [{"name": s.name, "category": s.category, "confidence": s.confidence_score, "source_sentence": s.source_sentence} for s in cand.skills],
        "education": [{"degree": e.degree, "field": e.field_of_study, "institution": e.institution, "cgpa": e.cgpa} for e in cand.educations],
        "experience": [{"company": exp.company, "role": exp.role, "start": exp.start_date, "end": exp.end_date} for exp in cand.experiences],
        "projects": [{"title": p.title, "description": p.description, "tech": p.technologies_json} for p in cand.projects]
    }

    if format.lower() == "json":
        data = Exporter.export_json(cand_dict)
        return Response(content=data, media_type="application/json", headers={"Content-Disposition": f"attachment; filename=candidate_{cand.id}.json"})
    elif format.lower() == "csv":
        data = Exporter.export_csv([cand_dict])
        return Response(content=data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=candidate_{cand.id}.csv"})
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'json' or 'csv'.")


@router.delete("/clear")
def clear_all_candidates(db: Session = Depends(get_db)):
    try:
        db.query(ProcessingLog).delete()
        db.query(CandidateMatch).delete()
        db.query(Skill).delete()
        db.query(Education).delete()
        db.query(Experience).delete()
        db.query(Project).delete()
        db.query(Certification).delete()
        
        resumes = db.query(Resume).all()
        for r in resumes:
            if r.file_path and os.path.exists(r.file_path):
                try:
                    os.remove(r.file_path)
                except Exception:
                    pass
                    
        db.query(Resume).delete()
        db.query(Candidate).delete()
        db.commit()
        return {"message": "All candidates and resumes cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    try:
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not cand:
            raise HTTPException(status_code=404, detail="Candidate not found.")
        db.query(CandidateMatch).filter(CandidateMatch.candidate_id == candidate_id).delete()
        db.query(Skill).filter(Skill.candidate_id == candidate_id).delete()
        db.query(Education).filter(Education.candidate_id == candidate_id).delete()
        db.query(Experience).filter(Experience.candidate_id == candidate_id).delete()
        db.query(Project).filter(Project.candidate_id == candidate_id).delete()
        db.query(Certification).filter(Certification.candidate_id == candidate_id).delete()
        
        resumes = db.query(Resume).filter(Resume.candidate_id == candidate_id).all()
        for r in resumes:
            db.query(ProcessingLog).filter(ProcessingLog.resume_id == r.id).delete()
            if r.file_path and os.path.exists(r.file_path):
                try:
                    os.remove(r.file_path)
                except Exception:
                    pass
            db.delete(r)

        db.delete(cand)
        db.commit()
        return {"message": f"Candidate {candidate_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
