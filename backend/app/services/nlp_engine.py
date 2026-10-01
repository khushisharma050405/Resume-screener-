import re
from typing import Dict, List, Tuple
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

SECTION_PATTERNS = {
    "SUMMARY": r"(?i)^(summary|profile|professional profile|career summary|about me|objective|executive summary)$",
    "EDUCATION": r"(?i)^(education|educational qualifications|academic background|qualifications|academic details|academic history)$",
    "EXPERIENCE": r"(?i)^(work experience|professional experience|employment history|experience|work history|career history|internships|industry experience)$",
    "SKILLS": r"(?i)^(technical skills|skills|core competencies|key skills|technologies|technical expertise|skills & tools|skillset)$",
    "PROJECTS": r"(?i)^(projects|academic projects|key projects|personal projects|selected projects|portfolio projects)$",
    "CERTIFICATIONS": r"(?i)^(certifications|licenses & certifications|certificates|professional certifications|training & certifications)$",
    "PUBLICATIONS": r"(?i)^(publications|research papers|patents & publications)$",
    "ACHIEVEMENTS": r"(?i)^(achievements|honors & awards|awards|key achievements|accomplishments)$"
}

class NLPEngine:
    """Preprocesses resume text, segments sentences, tokenizes, and classifies resume sections."""

    @staticmethod
    def preprocess_text(text: str) -> str:
        """Clean and normalize raw input text."""
        text = re.sub(r'[\u2022\u2023\u25e6\u2043\u2219]', '-', text)
        return text

    @staticmethod
    def segment_sentences(text: str) -> List[str]:
        """Sentence segmentation using spaCy or regex fallback."""
        if nlp is not None:
            doc = nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
            if sentences:
                return sentences
        
        # Fallback regex segmentation
        raw_sents = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in raw_sents if s.strip()]

    @staticmethod
    def classify_sections(raw_text: str) -> Dict[str, str]:
        """Classifies resume text into structured sections dynamically."""
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        
        # Initialize sections dict for all known patterns plus OTHER
        sections: Dict[str, List[str]] = {key: [] for key in SECTION_PATTERNS.keys()}
        sections["OTHER"] = []

        current_section = "SUMMARY"

        for line in lines:
            is_heading = False
            if len(line) < 40 and not line.endswith('.'):
                clean_line = re.sub(r'[:\-\|]', '', line).strip()
                for sec_key, pattern in SECTION_PATTERNS.items():
                    if re.match(pattern, clean_line):
                        current_section = sec_key
                        is_heading = True
                        break
            
            if not is_heading:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(line)

        result = {}
        for key, val in sections.items():
            if val:
                result[key] = "\n".join(val)

        if "SUMMARY" not in result or not result["SUMMARY"].strip():
            result["SUMMARY"] = "\n".join(lines[:5]) if lines else ""

        return result

    @staticmethod
    def extract_contact_info(text: str) -> Dict[str, str]:
        """Extracts email, phone, location, LinkedIn, GitHub, and Portfolio URLs via NLP regex patterns."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}'
        linkedin_pattern = r'(https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+)'
        github_pattern = r'(https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+)'

        email = re.search(email_pattern, text)
        phone = re.search(phone_pattern, text)
        linkedin = re.search(linkedin_pattern, text)
        github = re.search(github_pattern, text)

        phone_str = None
        if phone:
            match = phone.group(0).strip()
            if len(re.sub(r'\D', '', match)) >= 10:
                phone_str = match

        return {
            "email": email.group(0) if email else None,
            "phone": phone_str,
            "linkedin": linkedin.group(0) if linkedin else None,
            "github": github.group(0) if github else None,
        }
