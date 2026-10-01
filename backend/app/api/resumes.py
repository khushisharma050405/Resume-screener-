import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import Resume, Candidate, Skill, Education, Experience, Project, Certification, CandidateMatch, ProcessingLog, User
from backend.app.schemas.schemas import ResumeResponse
from backend.app.services.resume_parser import ResumeParser
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResumeResponse)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Please upload PDF or DOCX files.")

    # Save file to uploads folder
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(save_path)

    # 1. Create initial Resume record
    db_resume = Resume(
        filename=file.filename,
        file_path=save_path,
        file_type=ext.replace(".", "").upper(),
        file_size=file_size,
        processing_status="PROCESSING"
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    try:
        # 2. Parse using master ResumeParser NLP pipeline
        parsed = ResumeParser.parse_resume(save_path)

        # 3. Create or update Candidate record
        db_cand = Candidate(
            full_name=parsed["full_name"],
            email=parsed["email"],
            phone=parsed["phone"],
            location=parsed["location"],
            summary=parsed["summary"],
            linkedin_url=parsed["linkedin_url"],
            github_url=parsed["github_url"],
            portfolio_url=parsed["portfolio_url"],
            years_of_experience=parsed["years_of_experience"],
            top_skills_json=parsed["top_skills"],
            vector_embedding=parsed["vector_embedding"]
        )
        db.add(db_cand)
        db.commit()
        db.refresh(db_cand)

        # Add Skills
        for s in parsed["skills"]:
            db_skill = Skill(
                candidate_id=db_cand.id,
                name=s["name"],
                category=s["category"],
                confidence_score=s["confidence_score"],
                source_sentence=s["source_sentence"]
            )
            db.add(db_skill)

        # Add Education
        for e in parsed["education"]:
            db_edu = Education(
                candidate_id=db_cand.id,
                degree=e.get("degree"),
                field_of_study=e.get("field_of_study"),
                institution=e.get("institution"),
                start_year=e.get("start_year"),
                end_year=e.get("end_year"),
                cgpa=e.get("cgpa")
            )
            db.add(db_edu)

        # Add Experience
        for exp in parsed["experience"]:
            db_exp = Experience(
                candidate_id=db_cand.id,
                company=exp.get("company"),
                role=exp.get("role"),
                location=exp.get("location"),
                start_date=exp.get("start_date"),
                end_date=exp.get("end_date"),
                is_current=exp.get("is_current", False),
                duration_months=exp.get("duration_months", 12),
                responsibilities_json=exp.get("responsibilities", []),
                technologies_json=exp.get("technologies", [])
            )
            db.add(db_exp)

        # Add Projects
        for p in parsed["projects"]:
            db_proj = Project(
                candidate_id=db_cand.id,
                title=p["title"],
                description=p.get("description"),
                technologies_json=p.get("technologies", []),
                domain=p.get("domain"),
                url=p.get("url")
            )
            db.add(db_proj)

        # Update Resume record
        db_resume.candidate_id = db_cand.id
        db_resume.raw_text = parsed["raw_text"]
        db_resume.parsed_json = parsed
        db_resume.entities_json = parsed["entities"]
        db_resume.processing_status = "COMPLETED"

        log = ProcessingLog(
            resume_id=db_resume.id,
            stage="NLP_EXTRACTION",
            status="SUCCESS",
            details="Text extracted, entities labeled, skills categorized, embeddings generated."
        )
        db.add(log)
        db.commit()
        db.refresh(db_resume)

        return db_resume

    except Exception as e:
        db_resume.processing_status = "FAILED"
        log = ProcessingLog(
            resume_id=db_resume.id,
            stage="NLP_EXTRACTION",
            status="FAILED",
            details=str(e)
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")

@router.get("", response_model=List[ResumeResponse])
def list_resumes(db: Session = Depends(get_db)):
    return db.query(Resume).order_by(Resume.uploaded_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    res = db.query(Resume).filter(Resume.id == resume_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return res

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    try:
        res = db.query(Resume).filter(Resume.id == resume_id).first()
        if not res:
            raise HTTPException(status_code=404, detail="Resume not found.")
        
        # Clean processing logs
        db.query(ProcessingLog).filter(ProcessingLog.resume_id == resume_id).delete()
        
        cand_id = res.candidate_id
        if cand_id:
            cand = db.query(Candidate).filter(Candidate.id == cand_id).first()
            if cand:
                db.query(CandidateMatch).filter(CandidateMatch.candidate_id == cand_id).delete()
                db.query(Skill).filter(Skill.candidate_id == cand_id).delete()
                db.query(Education).filter(Education.candidate_id == cand_id).delete()
                db.query(Experience).filter(Experience.candidate_id == cand_id).delete()
                db.query(Project).filter(Project.candidate_id == cand_id).delete()
                db.query(Certification).filter(Certification.candidate_id == cand_id).delete()
                db.delete(cand)
        
        if res.file_path and os.path.exists(res.file_path):
            try:
                os.remove(res.file_path)
            except Exception:
                pass

        db.delete(res)
        db.commit()
        return {"message": f"Resume {resume_id} deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
