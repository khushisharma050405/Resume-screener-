from typing import Dict, List, Any
from backend.app.services.embedding_service import EmbeddingService

class JobMatcher:
    """Job-Agnostic Candidate Matcher using recruiter weights and NLP vector similarity."""

    @staticmethod
    def calculate_match(candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Skill Match & Coverage
        cand_skills = set(s.lower() for s in candidate_data.get("top_skills", []))
        req_skills = set(s.lower() for s in job_data.get("required_skills", []))
        pref_skills = set(s.lower() for s in job_data.get("preferred_skills", []))

        all_job_skills = req_skills.union(pref_skills)

        matched_req = req_skills.intersection(cand_skills)
        missing_req = req_skills.difference(cand_skills)

        matched_all = all_job_skills.intersection(cand_skills)

        skill_match_score = len(matched_all) / len(all_job_skills) if all_job_skills else 1.0
        required_skill_coverage = len(matched_req) / len(req_skills) if req_skills else 1.0

        # 2. Semantic Embedding Similarity
        cand_emb = candidate_data.get("vector_embedding", [])
        job_emb = job_data.get("vector_embedding", [])

        if not cand_emb or not job_emb:
            cand_text = f"{candidate_data.get('summary', '')} {' '.join(candidate_data.get('top_skills', []))}"
            job_text = job_data.get("raw_text", "")
            cand_emb = EmbeddingService.get_embedding(cand_text)
            job_emb = EmbeddingService.get_embedding(job_text)

        semantic_score = EmbeddingService.cosine_similarity(cand_emb, job_emb)

        # 3. Experience Score
        cand_exp = float(candidate_data.get("years_of_experience", 0.0))
        job_exp = float(job_data.get("min_experience_years", 0.0))

        if job_exp == 0:
            experience_score = 1.0
        elif cand_exp >= job_exp:
            experience_score = min(1.0, 0.85 + 0.15 * (cand_exp - job_exp) / job_exp)
        else:
            experience_score = max(0.2, cand_exp / job_exp)

        # 4. Education Score
        cand_edu = " ".join([e.get("degree", "") for e in candidate_data.get("education", [])]).lower()
        req_edu = (job_data.get("required_education") or "").lower()

        education_score = 0.85
        if not req_edu:
            education_score = 1.0
        elif "phd" in req_edu and "phd" in cand_edu:
            education_score = 1.0
        elif ("master" in req_edu or "m.tech" in req_edu or "ms" in req_edu or "mba" in req_edu):
            if any(k in cand_edu for k in ["master", "m.tech", "ms", "mba", "phd"]):
                education_score = 1.0
            elif any(k in cand_edu for k in ["bachelor", "b.tech", "bs", "ba"]):
                education_score = 0.85
        elif any(k in req_edu for k in ["bachelor", "b.tech", "bs", "ba"]):
            if any(k in cand_edu for k in ["bachelor", "b.tech", "bs", "ba", "master", "phd", "mba"]):
                education_score = 1.0

        # 5. Recruiter Weight Configuration
        weights = job_data.get("weight_config") or {
            "skill": 35,
            "semantic": 30,
            "experience": 15,
            "education": 10,
            "coverage": 10
        }

        w_skill = weights.get("skill", 35) / 100.0
        w_sem = weights.get("semantic", 30) / 100.0
        w_exp = weights.get("experience", 15) / 100.0
        w_edu = weights.get("education", 10) / 100.0
        w_cov = weights.get("coverage", 10) / 100.0

        overall_score = (
            w_skill * skill_match_score +
            w_sem * semantic_score +
            w_exp * experience_score +
            w_edu * education_score +
            w_cov * required_skill_coverage
        )

        overall_score_pct = round(overall_score * 100, 1)

        # Formulate explanations
        reasons = []
        if required_skill_coverage >= 0.8:
            reasons.append(f"Strong required skill alignment ({len(matched_req)}/{len(req_skills)} required skills matched).")
        elif missing_req:
            reasons.append(f"Missing required skills: {', '.join(list(missing_req)[:3])}.")

        if semantic_score >= 0.7:
            reasons.append(f"High semantic domain similarity ({round(semantic_score*100, 1)}%) to job description.")
        
        if cand_exp >= job_exp:
            reasons.append(f"Meets or exceeds required experience ({cand_exp} yrs vs {job_exp} yrs required).")
        else:
            reasons.append(f"Experience level ({cand_exp} yrs) below requirement ({job_exp} yrs).")

        return {
            "overall_score": overall_score_pct,
            "skill_match_score": round(skill_match_score * 100, 1),
            "semantic_score": round(semantic_score * 100, 1),
            "experience_score": round(experience_score * 100, 1),
            "education_score": round(education_score * 100, 1),
            "required_skill_coverage": round(required_skill_coverage * 100, 1),
            "matched_skills": sorted([s.title() for s in matched_all]),
            "missing_skills": sorted([s.title() for s in missing_req]),
            "match_reasons": reasons
        }
