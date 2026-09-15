"""
Question-bank duplicate detection (Phase 3).

Three levels, per spec:
  1. Exact text match
  2. Normalized text match (case / whitespace / punctuation-insensitive)
  3. Similarity / near-duplicate detection

Level 3 uses difflib.SequenceMatcher (Python stdlib) rather than an
embedding model. This project has no ML/vector-search dependency and
no external API calls (see assessment_ai.py's own docstring: "still no
LLM call"), so a real semantic-embedding similarity check isn't
available without adding new infrastructure. SequenceMatcher's ratio
is a pragmatic "where practical" implementation -- it reliably catches
minor-reword duplicates like the spec's own BFS example without
introducing a new dependency, but it is a textual-similarity heuristic,
not true semantic understanding. Flagging this honestly rather than
calling it "semantic similarity detection" it isn't.
"""
import re
import difflib
from sqlalchemy.orm import Session

from .. import question_bank_models as qbm

SIMILARITY_THRESHOLD = 0.87  # ratio above which two questions are treated as near-duplicates


def normalize_question(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^\w\s]", "", text)  # strip punctuation
    text = re.sub(r"\s+", " ", text)     # collapse whitespace
    return text


def is_duplicate(db: Session, job_id: int, question_text: str, question_type: str = None):
    """
    Returns the existing Question row this text duplicates, or None.
    Checks exact/normalized match first (one indexed lookup), then
    falls back to a similarity scan against the rest of this job's
    bank (optionally narrowed to one question type).
    """
    normalized = normalize_question(question_text)

    query = db.query(qbm.Question).filter(qbm.Question.job_id == job_id)
    if question_type:
        query = query.filter(qbm.Question.question_type == question_type)

    exact = query.filter(qbm.Question.normalized_text == normalized).first()
    if exact:
        return exact

    # O(n) scan against this job's existing bank for this type. Fine at
    # the scale this project runs at (hundreds, not millions, of
    # questions per job) -- a vector index would be genuine overkill for
    # a locally-run recruitment platform with no external services.
    for existing in query.all():
        ratio = difflib.SequenceMatcher(None, normalized, existing.normalized_text).ratio()
        if ratio >= SIMILARITY_THRESHOLD:
            return existing

    return None


def count_available(db: Session, job_id: int, question_type: str) -> int:
    return db.query(qbm.Question).filter(
        qbm.Question.job_id == job_id,
        qbm.Question.question_type == question_type,
    ).count()


def save_question(db: Session, job_id: int, question_type: str, question_text: str,
                   payload: dict, difficulty: str = "medium", topic: str = "",
                   skill: str = "", marks: float = 1.0, explanation: str = "",
                   source: str = "ai", created_by=None):
    """
    Persist a question that has ALREADY passed an is_duplicate() check
    by the caller. Does not re-check here -- callers own the
    check-then-decide ordering (reject vs. reuse vs. "add anyway") so
    this function doesn't silently make that call for them.
    """
    row = qbm.Question(
        job_id=job_id,
        question_type=question_type,
        question_text=question_text,
        normalized_text=normalize_question(question_text),
        difficulty=difficulty,
        topic=topic,
        skill=skill,
        marks=marks,
        explanation=explanation,
        payload=payload,
        source=source,
        created_by=created_by,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
