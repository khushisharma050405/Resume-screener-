# ResumeIQ — AI-Powered Resume Intelligence Platform

> **"Turn resumes into actionable intelligence."**  
> *"Understand candidates beyond keywords."*

ResumeIQ is a production-style, full-stack recruitment intelligence SaaS platform that parses unstructured PDF/DOCX resumes into structured candidate intelligence using **Natural Language Processing (NLP), Named Entity Recognition (NER), skill taxonomy extraction, 384-dimensional sentence embeddings, semantic candidate matching, candidate ranking, and skill gap analysis**.

---

## 🌟 Key Features

1. **Light-Theme Modern AI SaaS UI**
   - Premium white/off-white palette with soft indigo/purple accents (`#4F46E5`, `#8B5CF6`).
   - Built with Next.js (App Router), Tailwind CSS, Lucide icons, Recharts, and Framer Motion animations. Strictly **No Dark Mode**.

2. **Full-Stack REST Backend & ORM Database**
   - FastAPI Python backend with SQLAlchemy ORM and zero-config local SQLite database (PostgreSQL ready).
   - JWT session authentication with hashed passwords, protected routes, and a built-in demo recruiter account.

3. **Document Extraction & Cleaning**
   - Extracts clean text from PDF (PyMuPDF / pypdf) and DOCX (`python-docx`) files while preserving section structure.

4. **NLP & Named Entity Recognition (NER)**
   - Segmented text processing with spaCy (`en_core_web_sm`) and custom rules to extract: `PERSON`, `EMAIL`, `PHONE`, `LOCATION`, `ORGANIZATION`, `COMPANY`, `JOB_TITLE`, `DEGREE`, `UNIVERSITY`, `SKILL`, `PROJECT`, `CERTIFICATION`, `DATE`, `GPA`, and `ACHIEVEMENT`.

5. **Split-Screen Original Resume + AI Entity Annotations**
   - Interactive split view showcasing original text with color-coded entity overlays, character offsets, confidence scores, and source text snippets.

6. **Hierarchical Skill Taxonomy & Context Analysis**
   - Hybrid skill extraction engine detecting Programming, AI/ML, Frameworks, Databases, Cloud & DevOps, and Analytics skills.
   - Assigns confidence ratings (0-100%) and extracts exact source context sentences from the resume.

7. **Semantic Vector Embeddings**
   - `SentenceTransformer('all-MiniLM-L6-v2')` generating 384-dimensional dense normalized vector embeddings for resumes, sections, jobs, and skills.

8. **Multi-Factor Resume ↔ Job Matching & Ranking**
   - Transparent scoring formula:
     $$\text{Overall Match} = 0.35 \cdot \text{Skill Match} + 0.30 \cdot \text{Semantic Sim} + 0.15 \cdot \text{Experience Match} + 0.10 \cdot \text{Education Match} + 0.10 \cdot \text{Required Skill Coverage}$$
   - Leaderboard candidate ranking per job description with human-readable match reasons.

9. **Skill Gap Analysis**
   - Matched vs Missing skills visual cards with coverage metrics.

10. **Database-Grounded AI Recruiter Assistant**
    - Natural language search and Q&A engine querying actual database candidate records and vector similarities.

11. **ML Model Training & Evaluation Infrastructure**
    - `ml/` training pipeline (`prepare_dataset.py`, `train_ner.py`, `evaluate_model.py`, `predict.py`).
    - Dedicated `/model-evaluation` dashboard displaying Precision, Recall, and F1 metrics.

12. **Candidate Data Export**
    - Export parsed candidate profiles and match analysis to **JSON** and **CSV**.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL
- **NLP / ML**: PyMuPDF, python-docx, spaCy (`en_core_web_sm`), Sentence-Transformers (`all-MiniLM-L6-v2`), Scikit-learn, NumPy, PyTorch

---

## 🚀 Quick Start Guide

### Demo Credentials
- **Email**: `recruiter@resumeiq.ai`
- **Password**: `demo123`

### Running Backend (FastAPI)
```bash
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8001
```

### Running Frontend (Next.js)
```bash
cd frontend
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### Running ML Model Evaluation & Tests
```bash
python3 ml/evaluation/evaluate_model.py
python3 -m pytest backend/tests/test_api.py
```

---

## 🌐 Deployment Guide (Zero Configuration Issues)

### 1. Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your imported GitHub repository.
3. In **Root Directory**, choose `frontend`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend API URL (e.g. `https://your-backend.onrender.com/api`).
5. Click **Deploy**.

### 2. Deploy Backend on Render / Railway
1. Go to [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** pointing to your repository.
3. Settings:
   - **Environment**: Python 3.11+
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables (optional):
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL)
   - `DATABASE_URL`: (Optional PostgreSQL URL; defaults to local SQLite if omitted)

### 3. Deploy with Docker Compose
Run both backend and frontend together with a single command:
```bash
docker compose up --build
```
The frontend will be available at `http://localhost:3001` and the backend at `http://localhost:8001`.
