"""
Candidate <-> Job semantic matching AI.

Score = weighted blend of:
  1. Semantic similarity  (TF-IDF + cosine similarity over full text) — 40%
  2. Skill overlap        (Jaccard-style overlap of extracted skills)  — 45%
  3. Experience fit       (candidate years vs job minimum)             — 15%

This is a real, working "semantic matching" approach (bag-of-words /
TF-IDF vector space model) that runs fully offline. It's the classic
precursor to embedding-based matching — in the write-up/README we note
the upgrade path to sentence-transformer embeddings for true semantic
(meaning-based, not just word-overlap) matching.

Every sub-score is returned so the match is explainable to the recruiter
and candidate ("why did I get 78%?").
"""
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _text_similarity(resume_text: str, job_text: str) -> float:
    if not resume_text.strip() or not job_text.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf = vectorizer.fit_transform([resume_text, job_text])
    except ValueError:
        return 0.0
    sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    return float(max(0.0, min(1.0, sim)))


def _skill_overlap(candidate_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    cand_set = set(candidate_skills)
    req_set = set(required_skills)
    if not req_set:
        return 1.0, list(cand_set), []
    matched = sorted(cand_set & req_set)
    missing = sorted(req_set - cand_set)
    overlap_score = len(matched) / len(req_set)
    return overlap_score, matched, missing


def _experience_fit(candidate_years: float, min_years: float) -> float:
    if min_years <= 0:
        return 1.0
    if candidate_years >= min_years:
        return 1.0
    return round(max(0.0, candidate_years / min_years), 2)


def compute_match(
    resume_text: str,
    candidate_skills: List[str],
    candidate_years: float,
    job_text: str,
    required_skills: List[str],
    min_years: float,
) -> Dict:
    text_sim = _text_similarity(resume_text, job_text)
    skill_score, matched_skills, missing_skills = _skill_overlap(candidate_skills, required_skills)
    exp_score = _experience_fit(candidate_years, min_years)

    W_TEXT, W_SKILL, W_EXP = 0.40, 0.45, 0.15
    final_score = (text_sim * W_TEXT) + (skill_score * W_SKILL) + (exp_score * W_EXP)
    final_pct = round(final_score * 100, 1)

    breakdown = {
        "final_score": final_pct,
        "components": {
            "semantic_text_similarity": {
                "score": round(text_sim * 100, 1),
                "weight_pct": int(W_TEXT * 100),
                "explanation": "TF-IDF cosine similarity between resume text and job description.",
            },
            "skill_overlap": {
                "score": round(skill_score * 100, 1),
                "weight_pct": int(W_SKILL * 100),
                "explanation": f"{len(matched_skills)}/{len(required_skills) or 0} required skills matched.",
            },
            "experience_fit": {
                "score": round(exp_score * 100, 1),
                "weight_pct": int(W_EXP * 100),
                "explanation": f"Candidate has {candidate_years} yrs vs {min_years} yrs required.",
            },
        },
    }

    return {
        "match_score": final_pct,
        "breakdown": breakdown,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }


def rank_candidates(matches: List[Dict]) -> List[Dict]:
    """matches: list of dicts each containing at least 'match_score'."""
    return sorted(matches, key=lambda m: m["match_score"], reverse=True)
