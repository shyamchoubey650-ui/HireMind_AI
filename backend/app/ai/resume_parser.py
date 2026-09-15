"""
Resume / Job-Description parsing AI.

Approach (fully offline, no API key required):
  - Curated skills taxonomy (~180 common tech skills). Easy to extend.
  - Regex-based extraction for email, phone, years of experience, education.
  - Skill extraction via normalized keyword + alias matching over the text.

This is intentionally explainable (no black-box LLM call needed to demo
"AI resume parsing" in an interview) but the same module can be swapped
to call an LLM (OpenAI/Claude/local model) later by replacing
`extract_skills()` internals — the function signature stays the same.
"""
import re
from typing import Dict, List

SKILLS_TAXONOMY: Dict[str, List[str]] = {
    # canonical_skill: [aliases...]
    "python": ["python", "py"],
    "java": ["java"],
    "javascript": ["javascript", "js", "es6"],
    "typescript": ["typescript", "ts"],
    "c++": ["c++", "cpp"],
    "c": ["c programming"],
    "c#": ["c#", "csharp", ".net"],
    "react": ["react", "reactjs", "react.js"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vuejs", "vue.js"],
    "node.js": ["node", "nodejs", "node.js"],
    "spring boot": ["spring boot", "springboot", "spring"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "sql": ["sql"],
    "postgresql": ["postgresql", "postgres"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure"],
    "gcp": ["gcp", "google cloud"],
    "git": ["git", "github", "gitlab"],
    "ci/cd": ["ci/cd", "cicd", "jenkins", "github actions"],
    "rest api": ["rest api", "restful", "rest"],
    "graphql": ["graphql"],
    "microservices": ["microservices", "microservice"],
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "dl"],
    "nlp": ["nlp", "natural language processing"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data structures": ["data structures", "dsa"],
    "algorithms": ["algorithms"],
    "system design": ["system design"],
    "oop": ["oop", "object oriented programming", "object-oriented"],
    "linux": ["linux", "unix"],
    "agile": ["agile", "scrum"],
    "jira": ["jira"],
    "figma": ["figma"],
    "testing": ["unit testing", "junit", "pytest", "testing"],
    "kafka": ["kafka"],
    "rabbitmq": ["rabbitmq"],
    "spring": ["spring framework"],
    "hibernate": ["hibernate", "jpa"],
    "next.js": ["next.js", "nextjs"],
    "tailwind": ["tailwind", "tailwindcss"],
    "bootstrap": ["bootstrap"],
    "firebase": ["firebase"],
    "elasticsearch": ["elasticsearch"],
    "spark": ["apache spark", "spark"],
    "hadoop": ["hadoop"],
    "excel": ["excel", "ms excel"],
    "power bi": ["power bi", "powerbi"],
    "tableau": ["tableau"],
}

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(\+?\d{1,3}[\s-]?)?\d{10}")
YEARS_EXP_RE = re.compile(
    r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)\s*(?:of)?\s*experience", re.IGNORECASE
)
DEGREE_RE = re.compile(
    r"\b(B\.?Tech|M\.?Tech|Bachelor(?:'s)?|Master(?:'s)?|B\.?E\.?|M\.?E\.?|B\.?Sc|M\.?Sc|MBA|PhD|BCA|MCA)\b",
    re.IGNORECASE,
)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower())


def extract_skills(text: str) -> List[str]:
    """Return the list of canonical skills found in `text`."""
    norm = _normalize(text)
    found = []
    for canonical, aliases in SKILLS_TAXONOMY.items():
        for alias in aliases:
            # word-boundary-ish match, alias may contain punctuation like c++/c#
            pattern = re.escape(alias)
            if re.search(rf"(?<![a-z0-9]){pattern}(?![a-z0-9])", norm):
                found.append(canonical)
                break
    return sorted(set(found))


def extract_email(text: str) -> str:
    m = EMAIL_RE.search(text)
    return m.group(0) if m else ""


def extract_phone(text: str) -> str:
    m = PHONE_RE.search(text)
    return m.group(0) if m else ""


def extract_years_experience(text: str) -> float:
    matches = YEARS_EXP_RE.findall(text)
    if matches:
        return max(float(m) for m in matches)
    return 0.0


def extract_education(text: str) -> str:
    m = DEGREE_RE.search(text)
    return m.group(0) if m else ""


def parse_resume(text: str) -> Dict:
    return {
        "skills": extract_skills(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "years_experience": extract_years_experience(text),
        "education": extract_education(text),
    }


def parse_job_description(text: str) -> Dict:
    return {
        "required_skills": extract_skills(text),
        "min_experience": extract_years_experience(text),
    }
