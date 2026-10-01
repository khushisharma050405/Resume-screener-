import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.database.connection import engine, Base
from backend.app.api import auth, resumes, candidates, jobs, match, analytics, search, ai_assistant, evaluation, history, settings

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResumeIQ API",
    description="AI-Powered Resume Intelligence Platform REST APIs",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers with /api prefix AND root prefix for 100% compatibility
all_routers = [
    auth.router, resumes.router, candidates.router, jobs.router,
    match.router, analytics.router, search.router, ai_assistant.router,
    evaluation.router, history.router, settings.router
]
for r in all_routers:
    app.include_router(r, prefix="/api")
    app.include_router(r)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "ResumeIQ Backend API Engine",
        "docs": "/docs"
    }

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "healthy"}
