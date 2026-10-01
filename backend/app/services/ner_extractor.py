import re
from typing import List, Dict, Any
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

DEGREE_PATTERNS = [
    r"(?i)\b(B\.?E\.?|B\.?Tech|Bachelor of Technology|Bachelor of Engineering|B\.?S\.?|Bachelor of Science|B\.?A\.?|Bachelor of Arts)\b",
    r"(?i)\b(M\.?E\.?|M\.?Tech|Master of Technology|Master of Engineering|M\.?S\.?|Master of Science|M\.?A\.?|Master of Arts|M\.?B\.?A\.?|Master of Business Administration)\b",
    r"(?i)\b(Ph\.?D|Doctor of Philosophy|Diploma|Associate Degree)\b"
]

JOB_TITLE_PATTERNS = [
    r"(?i)\b(Software Engineer|Full Stack Developer|Frontend Developer|Backend Developer|Python Developer|Data Scientist|Machine Learning Engineer|AI Engineer|NLP Engineer|Data Analyst|Business Analyst|DevOps Engineer|Cloud Architect|Product Manager|System Administrator|QA Engineer|Research Scientist|Intern|Software Developer)\b"
]

UNIVERSITY_KEYWORDS = ["University", "Institute", "College", "School of", "IIT", "NIT", "BITS", "Stanford", "MIT", "Harvard", "Oxford", "Cambridge"]

GPA_PATTERNS = [
    r"(?i)\b(CGPA|GPA|Grade)?\s*[:\-]?\s*([0-9]\.[0-9]{1,2}\s*/\s*10|[0-9]\.[0-9]{1,2}\s*/\s*4\.0|[0-9]\.[0-9]{1,2})\b",
    r"(?i)\b([89][0-9]%\s*|100%|[67][0-9]%)\b"
]

CERTIFICATION_PATTERNS = [
    r"(?i)\b(AWS Certified [A-Za-z\s]+|Google Cloud Certified [A-Za-z\s]+|Azure Solutions Architect|CKA|CKAD|Certified Kubernetes [A-Za-z]+|PMP|Project Management Professional|Scrum Master|CSM|TensorFlow Developer Certificate|DeepLearning\.AI [A-Za-z\s]+|CompTIA [A-Za-z+]+|Microsoft Certified:? [A-Za-z\s]+|Certified [A-Za-z\s]{3,30})\b"
]

PROJECT_PATTERNS = [
    r"(?i)(?:Project|Case Study)[:\-]\s*([A-Z0-9][A-Za-z0-9\s\-–]{3,40})(?=\n|\.|—)",
    r"(?i)\b((?:Real-Time|Autonomous|AI-Powered|Distributed|Cloud-Native|Scalable|End-to-End)\s+[A-Za-z0-9\s]{3,35}(?:System|Platform|Engine|Pipeline|Application|Dashboard|Model))\b"
]

class NERExtractor:
    """Named Entity Recognition for resumes with character offsets and confidence ratings."""

    @staticmethod
    def extract_entities(text: str) -> List[Dict[str, Any]]:
        entities = []
        seen_spans = set()

        def add_entity(entity_str, label, conf, start, end):
            entity_str = entity_str.strip(" \t\r\n:;-,.")
            if not entity_str or len(entity_str) < 2:
                return
            span_key = (start, end)
            if span_key not in seen_spans:
                seen_spans.add(span_key)
                snippet_start = max(0, start - 30)
                snippet_end = min(len(text), end + 30)
                entities.append({
                    "entity": entity_str,
                    "type": label,
                    "confidence": round(conf, 2),
                    "start_char": start,
                    "end_char": end,
                    "source_text": text[snippet_start:snippet_end].replace("\n", " ").strip()
                })

        # 1. Contact info via regex
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        if email_match:
            add_entity(email_match.group(0), "EMAIL", 0.99, email_match.start(), email_match.end())

        phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}", text)
        if phone_match and len(re.sub(r"\D", "", phone_match.group(0))) >= 10:
            add_entity(phone_match.group(0), "PHONE", 0.95, phone_match.start(), phone_match.end())

        # 2. Education (Degree & University)
        for pattern in DEGREE_PATTERNS:
            for match in re.finditer(pattern, text):
                add_entity(match.group(0), "EDUCATION", 0.95, match.start(), match.end())

        for kw in UNIVERSITY_KEYWORDS:
            pattern = r"(?i)\b([A-Za-z\s]{0,25}" + re.escape(kw) + r"[A-Za-z\s]{0,25})\b"
            for match in re.finditer(pattern, text):
                clean_match = match.group(0).strip()
                first_line = clean_match.split("\n")[0]
                if len(clean_match) > 4 and len(first_line) < 60:
                    add_entity(first_line, "EDUCATION", 0.93, match.start(), match.start() + len(first_line))

        # 3. Job Title matching
        for pattern in JOB_TITLE_PATTERNS:
            for match in re.finditer(pattern, text):
                add_entity(match.group(0), "JOB_TITLE", 0.92, match.start(), match.end())

        # 4. Certification matching
        for pattern in CERTIFICATION_PATTERNS:
            for match in re.finditer(pattern, text):
                add_entity(match.group(0), "CERTIFICATION", 0.91, match.start(), match.end())

        # 5. Project matching
        for pattern in PROJECT_PATTERNS:
            for match in re.finditer(pattern, text):
                proj_name = match.group(1) if match.groups() else match.group(0)
                add_entity(proj_name, "PROJECT", 0.88, match.start(), match.end())

        # 6. Skill extraction from taxonomy with exact word boundaries
        from backend.app.services.skill_extractor import SKILL_TAXONOMY
        for category, skill_list in SKILL_TAXONOMY.items():
            for skill in skill_list:
                skill_pat = r"(?i)\b" + re.escape(skill) + r"\b"
                for match in re.finditer(skill_pat, text):
                    s_idx, e_idx = match.start(), match.end()
                    surrounding = text[max(0, s_idx-15):min(len(text), e_idx+15)]
                    if "@" in surrounding or "http" in surrounding:
                        continue
                    add_entity(match.group(0), "SKILL", 0.95, s_idx, e_idx)

        # 7. spaCy NER pipeline for PERSON, COMPANY, LOCATION
        if nlp is not None:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    add_entity(ent.text, "PERSON", 0.90, ent.start_char, ent.end_char)
                elif ent.label_ == "ORG":
                    if any(k.lower() in ent.text.lower() for k in UNIVERSITY_KEYWORDS):
                        add_entity(ent.text, "EDUCATION", 0.92, ent.start_char, ent.end_char)
                    else:
                        add_entity(ent.text, "COMPANY", 0.88, ent.start_char, ent.end_char)
                elif ent.label_ in ("GPE", "LOC"):
                    add_entity(ent.text, "LOCATION", 0.88, ent.start_char, ent.end_char)

        # 8. Fallback candidate name heuristic (first line if PERSON not detected)
        has_person = any(e["type"] == "PERSON" for e in entities)
        if not has_person:
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            if lines:
                first_line = lines[0]
                if len(first_line) < 40 and re.match(r"^[A-Za-z\s.-]+$", first_line):
                    start = text.find(first_line)
                    if start != -1:
                        add_entity(first_line, "PERSON", 0.85, start, start + len(first_line))

        # Sort entities by start_char
        entities.sort(key=lambda x: x["start_char"])
        return entities
