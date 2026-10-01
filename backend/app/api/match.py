from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import Candidate, JobDescription, CandidateMatch
from backend.app.schemas.schemas import MatchRequest, CandidateMatchDetail
from backend.app.services.job_matcher import JobMatcher

router = APIRouter(prefix="/match", tags=["Matching"])

@router.post("", response_model=List[CandidateMatchDetail])
def match_candidates(request: MatchRequest, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    if request.candidate_ids:
        candidates = db.query(Candidate).filter(Candidate.id.in_(request.candidate_ids)).all()
    else:
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

        existing_match = db.query(CandidateMatch).filter(
            CandidateMatch.candidate_id == cand.id,
            CandidateMatch.job_id == job.id
        ).first()

        # Determine stage based on score if not manually set
        stage = "STRONG_MATCH" if res["overall_score"] >= 85 else ("SCREENED" if res["overall_score"] >= 65 else "SCREENED")

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
        db.refresh(match_obj)

        match_results.append(CandidateMatchDetail(
            id=match_obj.id,
            candidate_id=cand.id,
            candidate_name=cand.full_name,
            candidate_role=cand.experiences[0].role if cand.experiences else "Candidate",
            job_id=job.id,
            job_title=job.title,
            overall_score=match_obj.overall_score,
            skill_match_score=match_obj.skill_match_score,
            semantic_score=match_obj.semantic_score,
            experience_score=match_obj.experience_score,
            education_score=match_obj.education_score,
            required_skill_coverage=match_obj.required_skill_coverage,
            matched_skills=match_obj.matched_skills_json or [],
            missing_skills=match_obj.missing_skills_json or [],
            match_reasons=match_obj.match_reasons_json or []
        ))

    match_results.sort(key=lambda x: x.overall_score, reverse=True)
    return match_results

@router.put("/{match_id}/stage")
def update_match_stage(match_id: int, payload: Dict[str, str] = Body(...), db: Session = Depends(get_db)):
    m = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match record not found.")

    new_stage = payload.get("stage", "SCREENED")
    m.stage = new_stage
    db.commit()
    db.refresh(m)
    return {"id": m.id, "candidate_id": m.candidate_id, "stage": m.stage}

@router.get("/{match_id}", response_model=CandidateMatchDetail)
def get_match(match_id: int, db: Session = Depends(get_db)):
    m = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match record not found.")

    return CandidateMatchDetail(
        id=m.id,
        candidate_id=m.candidate_id,
        candidate_name=m.candidate.full_name,
        candidate_role=m.candidate.experiences[0].role if m.candidate.experiences else "Candidate",
        job_id=m.job_id,
        job_title=m.job.title,
        overall_score=m.overall_score,
        skill_match_score=m.skill_match_score,
        semantic_score=m.semantic_score,
        experience_score=m.experience_score,
        education_score=m.education_score,
        required_skill_coverage=m.required_skill_coverage,
        matched_skills=m.matched_skills_json or [],
        missing_skills=m.missing_skills_json or [],
        match_reasons=m.match_reasons_json or []
    )


@router.post("/screen-resume")
def screen_resume_against_job(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Job-agnostic resume screener:
    Takes any job description and any resume text (or candidate_id),
    evaluates suitability across all industries (Tech, Finance, Healthcare, Design, Marketing, Legal, etc.),
    and provides concrete, actionable AI suggestions on what to add to make it suitable.
    """
    job_title = payload.get("job_title", "Target Role")
    job_text = payload.get("job_text", "")
    resume_text = payload.get("resume_text", "")
    candidate_id = payload.get("candidate_id")

    cand_skills = []
    cand_exp = 3.0
    cand_name = "Candidate"

    if candidate_id:
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if cand:
            cand_name = cand.full_name
            cand_skills = cand.top_skills_json or []
            cand_exp = cand.years_of_experience or 3.0
            if not resume_text:
                resume_text = f"{cand.summary or ''} {' '.join(cand_skills)}"
                if cand.experiences:
                    for e in cand.experiences:
                        resume_text += f" {e.role} at {e.company}: {' '.join(e.responsibilities_json or [])}"

    from backend.app.services.skill_extractor import SkillExtractor
    from backend.app.services.embedding_service import EmbeddingService
    from backend.app.services.embedding_service import EmbeddingService

    # Extract requirements from job_text dynamically
    extracted_job_skills = SkillExtractor.extract_skills(job_text)
    all_job_skills = [s["name"] for s in extracted_job_skills]
    if not all_job_skills:
        # Fallback keyword extraction for any non-IT domains (Finance, Healthcare, Legal, Supply Chain, etc.)
        import re
        words = re.findall(r'[A-Z][a-zA-Z0-9\+\#\.]+|[a-zA-Z]{4,}', job_text)
        all_job_skills = list(set([w.title() for w in words if len(w) > 3 and w.lower() not in ['with', 'that', 'this', 'have', 'from', 'team', 'years', 'experience', 'looking', 'ideal', 'candidate', 'should', 'must', 'their', 'work', 'working']]))[:8]

    # If resume_text provided, extract skills
    if not cand_skills and resume_text:
        extracted_cand = SkillExtractor.extract_skills(resume_text)
        cand_skills = [s["name"] for s in extracted_cand]
        cand_exp = 3.0

    # Compute matches
    cand_skills_lower = set(s.lower() for s in cand_skills)
    matched_skills = [s for s in all_job_skills if s.lower() in cand_skills_lower or any(s.lower() in cs for cs in cand_skills_lower)]
    missing_skills = [s for s in all_job_skills if s not in matched_skills]

    # Embeddings
    cand_emb = EmbeddingService.get_embedding(resume_text if resume_text else "Candidate Profile")
    job_emb = EmbeddingService.get_embedding(job_text if job_text else job_title)
    semantic_score = round(EmbeddingService.cosine_similarity(cand_emb, job_emb) * 100, 1)

    # Skill coverage
    skill_coverage = round((len(matched_skills) / len(all_job_skills) * 100) if all_job_skills else 80.0, 1)

    # Overall score formula
    overall_score = round(0.40 * skill_coverage + 0.35 * semantic_score + 0.15 * min(100.0, (cand_exp / max(1.0, payload.get("min_experience_years", 2.0))) * 85) + 0.10 * 85.0, 1)

    # Suitability Verdict
    if overall_score >= 80:
        verdict = "HIGHLY_SUITABLE"
        verdict_label = "Highly Suitable / Strong Match"
        verdict_summary = f"This resume demonstrates strong suitability for the {job_title} role, with high semantic domain alignment ({semantic_score}%) and {len(matched_skills)}/{len(all_job_skills)} core competencies demonstrated."
    elif overall_score >= 60:
        verdict = "PARTIALLY_SUITABLE"
        verdict_label = "Partially Suitable / Moderate Fit"
        verdict_summary = f"This resume has foundational transferable skills for {job_title} ({overall_score}% match), but requires strengthening in critical job-specific competencies and role framing to be fully competitive."
    else:
        verdict = "NOT_SUITABLE"
        verdict_label = "Not Currently Suitable / Needs Major Revisions"
        verdict_summary = f"Significant competency gaps exist between this resume and the requirements for {job_title}. Key industry terminology, tools, and quantified achievements must be incorporated."

    # Actionable Suggestions on WHAT ALL TO ADD
    suggestions = {
        "critical_missing_skills": missing_skills[:6] if missing_skills else ["Domain-specific analytics", "Process documentation", "Cross-functional leadership"],
        "recommended_bullet_points": [
            f"Add a quantified bullet demonstrating hands-on experience with {missing_skills[0] if missing_skills else 'core tools'} (e.g., 'Utilized {missing_skills[0] if missing_skills else 'industry tools'} to optimize workflow efficiency by 25%').",
            f"Explicitly mention collaboration with cross-functional stakeholders relevant to {job_title}.",
            f"Incorporate domain keywords from the job description: {', '.join((missing_skills[:3] if missing_skills else ['Scalability', 'Methodology', 'Execution']))} into your most recent experience summary."
        ],
        "ats_keywords_to_add": missing_skills[:5] if missing_skills else ["Strategic Planning", "Workflow Optimization", "KPI Tracking"],
        "recommended_certifications": [
            f"Relevant industry credential in {job_title.split()[0]} or certified practitioner course",
            "Project & Agile Management certification (e.g., Scrum / PMP / Six Sigma depending on domain)"
        ]
    }

    return {
        "candidate_name": cand_name,
        "job_title": job_title,
        "overall_score": overall_score,
        "suitability": verdict,
        "suitability_label": verdict_label,
        "suitability_summary": verdict_summary,
        "semantic_score": semantic_score,
        "skill_coverage_score": skill_coverage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    }
