import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="recruiter")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    years_of_experience = Column(Float, default=0.0)
    top_skills_json = Column(JSON, default=list)
    vector_embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="candidate", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="candidate", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="candidate", cascade="all, delete-orphan")
    matches = relationship("CandidateMatch", back_populates="candidate", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True)
    entities_json = Column(JSON, nullable=True)
    processing_status = Column(String(50), default="COMPLETED")
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")
    processing_logs = relationship("ProcessingLog", back_populates="resume", cascade="all, delete-orphan")

class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    degree = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)
    institution = Column(String(255), nullable=True)
    start_year = Column(String(50), nullable=True)
    end_year = Column(String(50), nullable=True)
    cgpa = Column(String(50), nullable=True)

    candidate = relationship("Candidate", back_populates="educations")

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    company = Column(String(255), nullable=True)
    role = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    start_date = Column(String(100), nullable=True)
    end_date = Column(String(100), nullable=True)
    is_current = Column(Boolean, default=False)
    duration_months = Column(Integer, default=0)
    responsibilities_json = Column(JSON, default=list)
    technologies_json = Column(JSON, default=list)

    candidate = relationship("Candidate", back_populates="experiences")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    confidence_score = Column(Float, default=1.0)
    source_sentence = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies_json = Column(JSON, default=list)
    domain = Column(String(100), nullable=True)
    url = Column(String(255), nullable=True)

    candidate = relationship("Candidate", back_populates="projects")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    name = Column(String(255), nullable=False)
    issuing_organization = Column(String(255), nullable=True)
    date_issued = Column(String(100), nullable=True)

    candidate = relationship("Candidate", back_populates="certifications")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    department = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    employment_type = Column(String(100), default="Full-time")
    raw_text = Column(Text, nullable=False)
    required_skills_json = Column(JSON, default=list)
    preferred_skills_json = Column(JSON, default=list)
    min_experience_years = Column(Float, default=0.0)
    required_education = Column(String(255), nullable=True)
    weight_config_json = Column(JSON, nullable=True) # Custom recruiter weights: {"skill": 35, "semantic": 30, "experience": 15, "education": 10, "coverage": 10}
    requirements_json = Column(JSON, nullable=True) # Editable dynamic requirement cards
    vector_embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    matches = relationship("CandidateMatch", back_populates="job", cascade="all, delete-orphan")

class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    skill_match_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    required_skill_coverage = Column(Float, nullable=False)
    matched_skills_json = Column(JSON, default=list)
    missing_skills_json = Column(JSON, default=list)
    match_reasons_json = Column(JSON, default=list)
    stage = Column(String(50), default="SCREENED") # ALL, SCREENED, STRONG_MATCH, SHORTLISTED, INTERVIEW
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="matches")
    job = relationship("JobDescription", back_populates="matches")

class ProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    stage = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="processing_logs")
