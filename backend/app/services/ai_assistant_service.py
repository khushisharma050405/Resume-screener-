from typing import Dict, Any, List
import re
from sqlalchemy.orm import Session
from backend.app.database.models import Candidate, Skill, CandidateMatch, JobDescription, Resume
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.job_matcher import JobMatcher

class AIAssistantService:
    """Conversational Recruiter AI Chatbot Engine."""

    @staticmethod
    def answer_query(db: Session, query: str) -> Dict[str, Any]:
        raw_query = query.strip()
        clean_query = re.sub(r'[^\w\s]', '', query).strip()
        query_lower = clean_query.lower()
        candidates = db.query(Candidate).all()
        jobs = db.query(JobDescription).all()

        # 1. Natural Conversational Greetings
        greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hi there', 'hello there']
        if query_lower in greetings or any(query_lower == g for g in greetings):
            return {
                'answer': 'Hello! 👋 How can I assist you with candidate screening or job matching today?',
                'matched_candidates': [],
                'sql_reasoning': 'Conversational Greeting'
            }

        # 2. Conversational Small Talk (e.g. "how are you", "what's up")
        small_talk = ['how are you', 'how are u', 'how do you do', 'how is it going', 'hows it going', 'whats up', "what's up", 'how are things', 'how have you been']
        if any(st in query_lower for st in small_talk):
            return {
                'answer': "I'm doing great, thank you for asking! 😊 I'm ready to help you screen candidates, evaluate ATS scores, or find the best matches for your open roles. How can I help you today?",
                'matched_candidates': [],
                'sql_reasoning': 'Conversational Small Talk Intent'
            }

        # 3. Conversational System Persona Questions
        if any(k in query_lower for k in ['who are you', 'what can you do', 'help', 'how do you work', 'what are you', 'who made you', 'what is your name']):
            return {
                'answer': "I'm your ResumeIQ AI Chatbot! I help recruiters evaluate resume matches, find top candidates for any job description, check skill gaps, and query candidate talent pools in real time. What would you like to search?",
                'matched_candidates': [],
                'sql_reasoning': 'Conversational Bot Persona Query'
            }

        # 4. Conversational Thanks & Farewells
        if any(k in query_lower for k in ['thanks', 'thank you', 'awesome', 'great', 'bye', 'goodbye', 'nice']) and not any(k in query_lower for k in ['candidate', 'job', 'skill', 'role']):
            return {
                'answer': "You're very welcome! Let me know whenever you need help screening candidates or analyzing job requirements. 😊",
                'matched_candidates': [],
                'sql_reasoning': 'Conversational Gratitude Intent'
            }

        # 5. Real-Time System Metrics Intent (only if explicitly asked for status/metrics)
        if any(k in query_lower for k in ['status', 'pipeline summary', 'database stats', 'how many candidates', 'system metrics']):
            ans = f'You currently have **{len(jobs)} active job position(s)** and **{len(candidates)} candidate profile(s)** parsed in your talent database.'
            return {
                'answer': ans,
                'matched_candidates': [],
                'sql_reasoning': 'SELECT COUNT(*) FROM candidates, jobs;'
            }

        if not candidates:
            return {
                'answer': 'No candidates are currently in your talent database. Upload resumes to start screening!',
                'matched_candidates': [],
                'sql_reasoning': 'SELECT * FROM candidates -> 0 records found.'
            }

        # 6. Job Role Suitability Queries (e.g. "Find candidates suitable for NLP Engineer")
        matched_job = None
        for j in jobs:
            if j.title.lower() in query_lower or any(word in query_lower for word in j.title.lower().split() if len(word) > 2):
                matched_job = j
                break

        recruiter_keywords = ['role', 'job', 'suitable', 'position', 'fit', 'screen', 'candidate', 'engineer', 'developer', 'analyst', 'manager', 'designer', 'find', 'who', 'top', 'best', 'python', 'sql', 'aws', 'pytorch', 'experience', 'skills']
        is_recruiter_query = matched_job or any(k in query_lower for k in recruiter_keywords)

        if is_recruiter_query:
            target_job = matched_job or (jobs[0] if jobs else None)
            if target_job:
                job_dict = {
                    'id': target_job.id,
                    'title': target_job.title,
                    'raw_text': target_job.raw_text,
                    'required_skills': target_job.required_skills_json or [],
                    'preferred_skills': target_job.preferred_skills_json or [],
                    'min_experience_years': target_job.min_experience_years,
                    'required_education': target_job.required_education,
                    'weight_config': target_job.weight_config_json,
                    'vector_embedding': target_job.vector_embedding
                }

                rankings = []
                for cand in candidates:
                    cand_dict = {
                        'id': cand.id,
                        'full_name': cand.full_name,
                        'summary': cand.summary,
                        'years_of_experience': cand.years_of_experience,
                        'top_skills': cand.top_skills_json or [],
                        'vector_embedding': cand.vector_embedding,
                        'education': [{'degree': e.degree} for e in cand.educations]
                    }
                    m = JobMatcher.calculate_match(cand_dict, job_dict)
                    rankings.append({
                        'id': cand.id,
                        'full_name': cand.full_name,
                        'years_of_experience': cand.years_of_experience,
                        'top_skills': cand.top_skills_json or [],
                        'match_score': m['overall_score'],
                        'skill_score': m['skill_match_score'],
                        'semantic_score': m['semantic_score'],
                        'reasons': m['match_reasons']
                    })

                rankings.sort(key=lambda x: x['match_score'], reverse=True)
                top = rankings[0]
                second = rankings[1] if len(rankings) > 1 else None

                ans = f"The top match for **{target_job.title}** is **{top['full_name']}** with a **{top['match_score']}% Match Score** ({top['years_of_experience']} yrs exp)." + (f" Runner up is **{second['full_name']}** ({second['match_score']}%)." if second else "")

                return {
                    'answer': ans,
                    'matched_candidates': rankings[:3],
                    'sql_reasoning': f"Matched candidate vector embeddings against Job #{target_job.id} ({target_job.title})"
                }

        # 7. Missing Skills Query (e.g. "Which candidates are missing AWS?")
        if 'missing' in query_lower or 'lacks' in query_lower or 'without' in query_lower:
            words = query_lower.replace('missing', '').replace('lacks', '').replace('without', '').split()
            target_skill = words[-1].upper() if words else 'AWS'
            missing_cands = []
            present_cands = []
            for c in candidates:
                cand_skills = [s.lower() for s in (c.top_skills_json or [])]
                if any(target_skill.lower() in s for s in cand_skills):
                    present_cands.append(c)
                else:
                    missing_cands.append(c)

            if missing_cands:
                names = ', '.join([f"**{c.full_name}**" for c in missing_cands[:4]])
                ans = f"**{len(missing_cands)} candidate(s)** are missing **{target_skill}**: {names}."
            else:
                ans = f"All candidates in your talent pool currently have **{target_skill}**!"

            matched_widgets = [{
                'id': c.id,
                'full_name': c.full_name,
                'years_of_experience': c.years_of_experience,
                'top_skills': c.top_skills_json or [],
                'match_score': 90.0 if c in present_cands else 40.0,
                'reasons': [f'Missing {target_skill}' if c in missing_cands else f'Has {target_skill}']
            } for c in candidates]

            return {
                'answer': ans,
                'matched_candidates': matched_widgets[:3],
                'sql_reasoning': f'Filtered candidates table for missing skill: {target_skill}'
            }

        # 8. Fallback Semantic Vector Match for open-ended recruiter queries
        query_vec = EmbeddingService.get_embedding(query)
        cand_rankings = []
        for cand in candidates:
            cand_skills = [s.lower() for s in (cand.top_skills_json or [])]
            cand_text = f"{cand.full_name} {cand.summary} {' '.join(cand_skills)}"
            cand_vec = cand.vector_embedding or EmbeddingService.get_embedding(cand_text)
            sim = EmbeddingService.cosine_similarity(query_vec, cand_vec)
            skill_hits = [s for s in cand_skills if s in query_lower]
            boost = len(skill_hits) * 0.15
            final_score = round(min(99.0, max(25.0, (sim * 0.7 + boost + 0.25) * 100)), 1)
            cand_rankings.append({
                'id': cand.id,
                'full_name': cand.full_name,
                'years_of_experience': cand.years_of_experience,
                'top_skills': cand.top_skills_json or [],
                'match_score': final_score,
                'reasons': [f'Matched intent with {round(sim*100, 1)}% vector similarity']
            })

        cand_rankings.sort(key=lambda x: x['match_score'], reverse=True)
        top = cand_rankings[0]
        ans = f"Top candidate match for query is **{top['full_name']}** ({top['match_score']}% Match, {top['years_of_experience']} yrs exp)."

        return {
            'answer': ans,
            'matched_candidates': cand_rankings[:3],
            'sql_reasoning': f"Dense vector search for query"
        }
