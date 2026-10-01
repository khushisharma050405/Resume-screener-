from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "recruiter" # recruiter or candidate

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- Resume & Entity Schemas ---
class EntityItem(BaseModel):
    entity: str
    type: str # PERSON, EMAIL, PHONE, LOCATION, COMPANY, JOB_TITLE, DEGREE, UNIVERSITY, SKILL, PROJECT, CERTIFICATION, DATE, GPA, ACHIEVEMENT
    confidence: float
    start_char: int
    end_char: int
    source_text: str

class SkillItem(BaseModel):
    name: str
    category: str
    confidence_score: float
    source_sentence: Optional[str] = None

class EducationItem(BaseModel):
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    institution: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    cgpa: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    duration_months: int = 0
    responsibilities: List[str] = []
    technologies: List[str] = []

class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    domain: Optional[str] = None
    url: Optional[str] = None

class CertificationItem(BaseModel):
    name: str
    issuing_organization: Optional[str] = None
    date_issued: Optional[str] = None

class ParsedResumeData(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: float = 0.0
    sections: Dict[str, str] = {}
    entities: List[EntityItem] = []
    skills: List[SkillItem] = []
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []

class ResumeResponse(BaseModel):
    id: int
    candidate_id: Optional[int] = None
    filename: str
    file_type: str
    file_size: int
    processing_status: str
    uploaded_at: datetime
    parsed_json: Optional[Dict[str, Any]] = None
    entities_json: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)

# --- Candidate Schemas ---
class CandidateResponse(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: float
    top_skills_json: List[str]
    created_at: datetime
    skills: List[SkillItem] = []
    educations: List[EducationItem] = []
    experiences: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []

    model_config = ConfigDict(from_attributes=True)

# --- Job Description Schemas ---
class JobCreate(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Remote / On-site"
    raw_text: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_years: float = 0.0
    required_education: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    title: str
    department: Optional[str]
    location: Optional[str]
    raw_text: str
    required_skills_json: List[str]
    preferred_skills_json: List[str]
    min_experience_years: float
    required_education: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Match & Ranking Schemas ---
class MatchRequest(BaseModel):
    job_id: int
    candidate_ids: Optional[List[int]] = None # If None, match all candidates

class CandidateMatchDetail(BaseModel):
    id: int
    candidate_id: int
    candidate_name: str
    candidate_role: Optional[str] = None
    job_id: int
    job_title: str
    overall_score: float
    skill_match_score: float
    semantic_score: float
    experience_score: float
    education_score: float
    required_skill_coverage: float
    matched_skills: List[str]
    missing_skills: List[str]
    match_reasons: List[str]

# --- Search & Assistant Schemas ---
class SearchQuery(BaseModel):
    query: str
    min_score: float = 0.0

class AIAssistantRequest(BaseModel):
    query: str

class AIAssistantResponse(BaseModel):
    answer: str
    matched_candidates: List[Dict[str, Any]] = []
    sql_reasoning: Optional[str] = None

# --- ML Model Evaluation Schema ---
class EntityMetric(BaseModel):
    entity: str
    precision: float
    recall: float
    f1: float
    support: int

class ModelEvaluationReport(BaseModel):
    model_name: str
    overall_precision: float
    overall_recall: float
    overall_f1: float
    entity_metrics: List[EntityMetric]
    evaluation_date: str
