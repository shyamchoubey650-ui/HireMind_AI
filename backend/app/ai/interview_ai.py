"""
Interview-question generation + skill-gap analysis AI.

Template-driven generator keyed off the skills taxonomy, biased toward:
  - matched skills (verify depth of claimed expertise)
  - missing/required skills (probe willingness/ability to learn)
  - one experience-based / behavioral question
  - one system-design question if seniority (years_experience) suggests it

Swappable: replace `generate_questions()` body with an LLM prompt call
(e.g. Claude) for open-ended generation once you wire in an API key —
the function signature and callers stay identical.
"""
from typing import List, Dict

SKILL_QUESTION_BANK: Dict[str, List[str]] = {
    "python": [
        "Explain the difference between a list and a tuple in Python, and when you'd use each.",
        "How does Python's GIL affect multithreaded programs?",
    ],
    "java": [
        "Explain the difference between an abstract class and an interface in Java.",
        "How does garbage collection work in the JVM?",
    ],
    "spring boot": [
        "Walk me through how dependency injection works in Spring Boot.",
        "How would you secure a REST endpoint in Spring Boot using JWT?",
    ],
    "react": [
        "Explain the difference between state and props in React.",
        "How would you optimize a React app that's re-rendering too often?",
    ],
    "sql": [
        "Write a query to find the second-highest salary in an Employees table.",
        "Explain the difference between INNER JOIN and LEFT JOIN with an example.",
    ],
    "postgresql": [
        "How would you design indexes for a table with frequent read-heavy queries?",
    ],
    "docker": [
        "Explain the difference between a Docker image and a container.",
    ],
    "machine learning": [
        "Explain the bias-variance tradeoff and how you'd address overfitting.",
    ],
    "system design": [
        "Design a URL shortener service — walk through your high-level architecture.",
    ],
    "rest api": [
        "What makes an API RESTful, and how would you version a public API?",
    ],
}

GENERIC_BEHAVIORAL = [
    "Tell me about a challenging project you worked on and how you overcame the biggest obstacle.",
    "Describe a time you disagreed with a teammate's technical decision. How did you handle it?",
    "How do you approach learning a new technology you've never used before?",
]

GENERIC_MISSING_SKILL_TEMPLATE = (
    "The role requires {skill}, which isn't on your resume — have you worked with anything similar, "
    "and how quickly could you get up to speed?"
)


def generate_questions(matched_skills: List[str], missing_skills: List[str], years_experience: float, job_title: str) -> List[str]:
    questions: List[str] = []

    # Probe depth on skills they claim to have
    for skill in matched_skills[:3]:
        bank = SKILL_QUESTION_BANK.get(skill)
        if bank:
            questions.append(bank[0])

    # Probe gaps
    for skill in missing_skills[:2]:
        questions.append(GENERIC_MISSING_SKILL_TEMPLATE.format(skill=skill))

    # Seniority-based system design question
    if years_experience >= 3 and "system design" in SKILL_QUESTION_BANK:
        questions.append(SKILL_QUESTION_BANK["system design"][0])

    # Always include one behavioral question
    questions.append(GENERIC_BEHAVIORAL[0])

    # Role-flavored opener
    questions.insert(0, f"Walk me through your experience relevant to the {job_title} role.")

    # de-dupe, keep order
    seen = set()
    ordered = []
    for q in questions:
        if q not in seen:
            ordered.append(q)
            seen.add(q)
    return ordered[:7]


def skill_gap_analysis(matched_skills: List[str], missing_skills: List[str]) -> Dict:
    total_required = len(matched_skills) + len(missing_skills)
    coverage = round((len(matched_skills) / total_required) * 100, 1) if total_required else 100.0
    return {
        "coverage_pct": coverage,
        "strong_areas": matched_skills,
        "gaps": missing_skills,
        "recommendation": (
            "Strong fit — proceed to interview." if coverage >= 70
            else "Moderate fit — probe gaps in interview." if coverage >= 40
            else "Weak fit — significant skill gaps for this role."
        ),
    }
