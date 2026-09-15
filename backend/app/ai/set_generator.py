"""
Multi-set assessment generation with global uniqueness.

QUESTION SOURCES, IN ORDER:

1. Whatever is already persisted in the question bank for this job/type.
   This includes BOTH recruiter-created questions and previously
   AI-generated questions.

2. Existing free hardcoded assessment_ai.py pools.

3. If a deficit remains, llm_question_generator.py generates exactly
   the missing count via OpenAI.

All questions pass through the same duplicate detection and persistence
pipeline.

Assessment sets are APPENDED, never overwritten.

If an assessment already contains:

    Set 1
    Set 2

then the next generation starts at:

    Set 3

This prevents the UNIQUE constraint violation on:

    (assessment_id, set_number)
"""

import uuid
from typing import List

from sqlalchemy.orm import Session

from .. import question_bank_models as qbm
from . import question_bank_ai as qb
from . import assessment_ai as aa


# ============================================================
# ERRORS
# ============================================================

class InsufficientQuestionsError(Exception):
    def __init__(
        self,
        question_type,
        required,
        available,
        missing,
    ):
        self.question_type = question_type
        self.required = required
        self.available = available
        self.missing = missing

        super().__init__(
            f"Not enough unique {question_type} questions: "
            f"need {required}, have {available}, missing {missing}"
        )


# ============================================================
# LLM SETTINGS
# ============================================================

LLM_MAX_ATTEMPT_MULTIPLIER = 3
LLM_BATCH_SIZE = 8


# ============================================================
# HARD-CODED QUESTION POOL
# ============================================================

def _candidate_pool_for_type(
    required_skills: List[str],
    question_type: str,
):
    """
    Return raw candidates from the existing hardcoded pools.
    """

    if question_type == "mcq":
        picked = aa._pick_round_robin(
            required_skills,
            "mcq",
            10_000,
        )

        picked = aa._dedupe_by_question_text(picked)

        seen = {
            aa.re.sub(
                r"\s+",
                " ",
                p["question"].strip().lower(),
            )
            for p in picked
        }

        for item in (
            list(aa.GENERIC_MCQ_POOL)
            + aa._flatten_full_bank("mcq")
        ):
            key = aa.re.sub(
                r"\s+",
                " ",
                item["question"].strip().lower(),
            )

            if key not in seen:
                picked.append(dict(item))
                seen.add(key)

        return picked

    if question_type == "fill_blank":
        picked = aa._pick_round_robin(
            required_skills,
            "fill_blank",
            10_000,
        )

        picked = aa._dedupe_by_question_text(picked)

        seen = {
            aa.re.sub(
                r"\s+",
                " ",
                p["question"].strip().lower(),
            )
            for p in picked
        }

        for item in (
            list(aa.GENERIC_FILL_BLANK_POOL)
            + aa._flatten_full_bank("fill_blank")
        ):
            key = aa.re.sub(
                r"\s+",
                " ",
                item["question"].strip().lower(),
            )

            if key not in seen:
                picked.append(dict(item))
                seen.add(key)

        return picked

    if question_type == "coding":
        return [
            dict(item)
            for item in aa.CODING_BANK
        ]

    return []


# ============================================================
# FINALIZE + SAVE QUESTION
# ============================================================

def _finalize_and_save(
    db: Session,
    job_id: int,
    question_type: str,
    candidate: dict,
    coding_skill_tag: str,
):
    """
    Normalize a candidate question and persist it to the question bank.
    """

    text = (
        candidate.get("question")
        or candidate.get("title")
        or ""
    )

    if not text:
        return None

    # --------------------------------------------------------
    # MCQ
    # --------------------------------------------------------

    if question_type == "mcq":
        finalized = aa._finalize_mcq(candidate)

        payload = {
            "options": finalized["options"],
            "correct_answer": finalized["correct_answer"],
        }

        marks = aa.MCQ_MARKS

    # --------------------------------------------------------
    # FILL BLANK
    # --------------------------------------------------------

    elif question_type == "fill_blank":
        finalized = aa._finalize_fill_blank(candidate)

        payload = {
            "expected_answer": finalized["expected_answer"],
            "accepted_answers": finalized["accepted_answers"],
        }

        marks = aa.FILL_BLANK_MARKS

    # --------------------------------------------------------
    # CODING
    # --------------------------------------------------------

    else:
        finalized = aa._finalize_coding(
            candidate,
            coding_skill_tag,
        )

        payload = {
            k: v
            for k, v in finalized.items()
            if k not in (
                "id",
                "type",
                "question",
                "marks",
                "difficulty",
                "skill_tag",
            )
        }

        marks = aa.CODING_MARKS

    return qb.save_question(
        db,
        job_id=job_id,
        question_type=question_type,
        question_text=text,
        payload=payload,
        difficulty=finalized.get(
            "difficulty",
            "medium",
        ),
        skill=finalized.get(
            "skill_tag",
            "",
        ),
        marks=marks,
        source="ai",
    )


# ============================================================
# LLM DEFICIT FILL
# ============================================================

def _fill_deficit_with_llm(
    db: Session,
    job_id: int,
    question_type: str,
    required_skills: List[str],
    deficit: int,
    coding_skill_tag: str,
) -> list:
    """
    Generate missing questions through the LLM.
    """

    from . import llm_question_generator as llm

    existing_texts = [
        row.question_text
        for row in (
            db.query(qbm.Question)
            .filter(
                qbm.Question.job_id == job_id,
                qbm.Question.question_type == question_type,
            )
            .order_by(
                qbm.Question.created_at.desc()
            )
            .limit(100)
            .all()
        )
    ]

    saved = []
    attempts = 0

    max_attempts = max(
        deficit * LLM_MAX_ATTEMPT_MULTIPLIER,
        LLM_BATCH_SIZE,
    )

    while (
        len(saved) < deficit
        and attempts < max_attempts
    ):
        remaining = deficit - len(saved)

        batch_size = min(
            max(
                remaining,
                LLM_BATCH_SIZE // 2,
            ),
            LLM_BATCH_SIZE,
        )

        try:
            candidates = llm.generate_batch(
                question_type,
                required_skills,
                existing_texts,
                batch_size,
            )

        except llm.LLMGenerationError:
            break

        if not candidates:
            attempts += batch_size
            continue

        for candidate in candidates:

            if len(saved) >= deficit:
                break

            attempts += 1

            text = (
                candidate.get("question")
                or candidate.get("title")
                or ""
            )

            if not text:
                continue

            if qb.is_duplicate(
                db,
                job_id,
                text,
                question_type,
            ):
                existing_texts.append(text)
                continue

            row = _finalize_and_save(
                db,
                job_id,
                question_type,
                candidate,
                coding_skill_tag,
            )

            if row:
                saved.append(row)
                existing_texts.append(text)

    return saved


# ============================================================
# CONTROLLED REUSE
# ============================================================

def _apply_controlled_reuse(
    saved: list,
    needed_count: int,
    per_set_count: int,
) -> list:
    """
    Last-resort controlled reuse.

    Questions can repeat across sets, but never within the same set.
    """

    if (
        not saved
        or len(saved) < per_set_count
    ):
        return saved

    extended = list(saved)

    i = 0

    while len(extended) < needed_count:
        extended.append(
            saved[i % len(saved)]
        )
        i += 1

    return extended


# ============================================================
# ENSURE UNIQUE QUESTIONS
# ============================================================

def ensure_unique_questions(
    db: Session,
    job_id: int,
    required_skills: List[str],
    question_type: str,
    needed_count: int,
    per_set_count: int = None,
    allow_controlled_reuse: bool = False,
) -> List[qbm.Question]:

    existing = (
        db.query(qbm.Question)
        .filter(
            qbm.Question.job_id == job_id,
            qbm.Question.question_type == question_type,
        )
        .all()
    )

    if len(existing) >= needed_count:
        return existing[:needed_count]

    coding_skill_tag = next(
        (
            s.lower().strip()
            for s in required_skills
            if s.lower().strip()
            in aa.CODEABLE_LANGUAGES
        ),
        "algorithms",
    )

    pool = _candidate_pool_for_type(
        required_skills,
        question_type,
    )

    saved = list(existing)

    # --------------------------------------------------------
    # HARD-CODED POOL
    # --------------------------------------------------------

    for candidate in pool:

        if len(saved) >= needed_count:
            break

        text = (
            candidate.get("question")
            or candidate.get("title")
            or ""
        )

        if not text:
            continue

        if qb.is_duplicate(
            db,
            job_id,
            text,
            question_type,
        ):
            continue

        row = _finalize_and_save(
            db,
            job_id,
            question_type,
            candidate,
            coding_skill_tag,
        )

        if row:
            saved.append(row)

    # --------------------------------------------------------
    # LLM
    # --------------------------------------------------------

    if len(saved) < needed_count:

        deficit = (
            needed_count
            - len(saved)
        )

        llm_saved = _fill_deficit_with_llm(
            db,
            job_id,
            question_type,
            required_skills,
            deficit,
            coding_skill_tag,
        )

        saved.extend(llm_saved)

    # --------------------------------------------------------
    # CONTROLLED REUSE
    # --------------------------------------------------------

    if (
        len(saved) < needed_count
        and allow_controlled_reuse
    ):
        saved = _apply_controlled_reuse(
            saved,
            needed_count,
            per_set_count or needed_count,
        )

    # --------------------------------------------------------
    # FINAL VALIDATION
    # --------------------------------------------------------

    if len(saved) < needed_count:

        raise InsufficientQuestionsError(
            question_type,
            needed_count,
            len(saved),
            needed_count - len(saved),
        )

    return saved[:needed_count]


# ============================================================
# QUESTION ROW -> SET DICT
# ============================================================

def _question_row_to_dict(
    row: qbm.Question,
) -> dict:

    base = {
        "id": uuid.uuid4().hex[:8],
        "type": row.question_type,
        "question": row.question_text,
        "marks": row.marks,
        "difficulty": row.difficulty,
        "skill_tag": row.skill,
    }

    base.update(
        row.payload or {}
    )

    # --------------------------------------------------------
    # CODING TEST CASES
    # --------------------------------------------------------

    if row.question_type == "coding":

        db_test_cases = (
            list(row.test_cases)
            if row.test_cases
            else []
        )

        if db_test_cases:

            base["visible_test_cases"] = [
                {
                    "input": tc.input,
                    "output": tc.expected_output,
                }
                for tc in db_test_cases
                if tc.is_public
            ]

            base["hidden_test_cases"] = [
                {
                    "input": tc.input,
                    "output": tc.expected_output,
                }
                for tc in db_test_cases
                if not tc.is_public
            ]

    return base


# ============================================================
# AVAILABILITY CHECK
# ============================================================

def check_availability(
    db: Session,
    job_id: int,
    required_skills: List[str],
    num_sets: int,
    mcq_count: int,
    fill_blank_count: int,
    coding_count: int,
) -> dict:

    needed = {
        "mcq": mcq_count * num_sets,
        "fill_blank": fill_blank_count * num_sets,
        "coding": coding_count * num_sets,
    }

    result = {
        "sufficient": True,
        "detail": {},
    }

    for qtype, required in needed.items():

        existing_count = qb.count_available(
            db,
            job_id,
            qtype,
        )

        pool_ceiling = len(
            _candidate_pool_for_type(
                required_skills,
                qtype,
            )
        )

        available_estimate = max(
            existing_count,
            min(
                pool_ceiling,
                required,
            ),
        )

        missing_estimate = max(
            0,
            required - available_estimate,
        )

        result["detail"][qtype] = {
            "required": required,
            "available_estimate": available_estimate,
            "missing_estimate": missing_estimate,
        }

        if missing_estimate > 0:
            result["sufficient"] = False

    return result


# ============================================================
# GET NEXT SET NUMBER
# ============================================================

def _get_next_set_number(
    db: Session,
    assessment_id: int,
) -> int:
    """
    Return the next available set number.

    Example:

        Existing:
            Set 1
            Set 2
            Set 3

        Returns:
            4

    This is the important fix for:

        UNIQUE constraint failed:
        assessment_sets.assessment_id,
        assessment_sets.set_number
    """

    existing_sets = (
        db.query(qbm.AssessmentSet)
        .filter(
            qbm.AssessmentSet.assessment_id
            == assessment_id
        )
        .order_by(
            qbm.AssessmentSet.set_number.desc()
        )
        .all()
    )

    if not existing_sets:
        return 1

    highest_number = max(
        int(s.set_number)
        for s in existing_sets
        if s.set_number is not None
    )

    return highest_number + 1


# ============================================================
# GENERATE SETS
# ============================================================

def generate_sets(
    db: Session,
    assessment_id: int,
    job_id: int,
    required_skills: List[str],
    num_sets: int,
    mcq_count: int,
    fill_blank_count: int,
    coding_count: int,
    allow_controlled_reuse: bool = False,
) -> List[qbm.AssessmentSet]:
    """
    Build assessment sets.

    IMPORTANT:

    Newly generated sets are APPENDED to the existing sets.

    If the assessment already has:

        Set 1

    and the recruiter generates one more set, the new set becomes:

        Set 2

    rather than attempting another Set 1.
    """

    # --------------------------------------------------------
    # BASIC VALIDATION
    # --------------------------------------------------------

    if num_sets < 1:
        raise ValueError(
            "num_sets must be at least 1"
        )

    if mcq_count < 0:
        raise ValueError(
            "mcq_count cannot be negative"
        )

    if fill_blank_count < 0:
        raise ValueError(
            "fill_blank_count cannot be negative"
        )

    if coding_count < 0:
        raise ValueError(
            "coding_count cannot be negative"
        )

    per_set_total = (
        mcq_count
        + fill_blank_count
        + coding_count
    )

    if per_set_total <= 0:
        raise ValueError(
            "Each assessment set must contain "
            "at least one question"
        )

    # --------------------------------------------------------
    # CALCULATE QUESTION REQUIREMENTS
    # --------------------------------------------------------

    total_mcq = ensure_unique_questions(
        db,
        job_id,
        required_skills,
        "mcq",
        mcq_count * num_sets,
        per_set_count=mcq_count,
        allow_controlled_reuse=allow_controlled_reuse,
    )

    total_fb = ensure_unique_questions(
        db,
        job_id,
        required_skills,
        "fill_blank",
        fill_blank_count * num_sets,
        per_set_count=fill_blank_count,
        allow_controlled_reuse=allow_controlled_reuse,
    )

    total_coding = ensure_unique_questions(
        db,
        job_id,
        required_skills,
        "coding",
        coding_count * num_sets,
        per_set_count=coding_count,
        allow_controlled_reuse=allow_controlled_reuse,
    )

    # --------------------------------------------------------
    # IMPORTANT FIX
    #
    # Find the next available set number BEFORE creating rows.
    # --------------------------------------------------------

    next_set_number = _get_next_set_number(
        db,
        assessment_id,
    )

    sets = []

    try:

        # ----------------------------------------------------
        # CREATE EACH SET
        # ----------------------------------------------------

        for offset in range(num_sets):

            set_number = (
                next_set_number
                + offset
            )

            # -----------------------------------------------
            # SLICE QUESTIONS
            # -----------------------------------------------

            mcq_slice = total_mcq[
                offset * mcq_count:
                (offset + 1) * mcq_count
            ]

            fb_slice = total_fb[
                offset * fill_blank_count:
                (offset + 1) * fill_blank_count
            ]

            coding_slice = total_coding[
                offset * coding_count:
                (offset + 1) * coding_count
            ]

            # -----------------------------------------------
            # BUILD QUESTION LIST
            # -----------------------------------------------

            questions = (
                [
                    _question_row_to_dict(r)
                    for r in mcq_slice
                ]
                +
                [
                    _question_row_to_dict(r)
                    for r in fb_slice
                ]
                +
                [
                    _question_row_to_dict(r)
                    for r in coding_slice
                ]
            )

            total_marks = sum(
                q["marks"]
                for q in questions
            )

            # -----------------------------------------------
            # VALIDATE QUESTION IDS
            # -----------------------------------------------

            ids = [
                q["id"]
                for q in questions
            ]

            assert len(ids) == len(set(ids)), (
                f"Set {set_number} has "
                f"duplicate question ids"
            )

            # -----------------------------------------------
            # VALIDATE QUESTION TEXT
            # -----------------------------------------------

            texts = [
                q["question"]
                .strip()
                .lower()
                for q in questions
            ]

            assert len(texts) == len(set(texts)), (
                f"Set {set_number} has a "
                f"duplicate question within itself"
            )

            # -----------------------------------------------
            # VALIDATE QUESTION TYPE COUNTS
            # -----------------------------------------------

            assert (
                len(mcq_slice)
                == mcq_count
            ), (
                f"Set {set_number} has wrong "
                f"MCQ count"
            )

            assert (
                len(fb_slice)
                == fill_blank_count
            ), (
                f"Set {set_number} has wrong "
                f"fill-blank count"
            )

            assert (
                len(coding_slice)
                == coding_count
            ), (
                f"Set {set_number} has wrong "
                f"coding count"
            )

            # -----------------------------------------------
            # CREATE DATABASE ROW
            # -----------------------------------------------

            row = qbm.AssessmentSet(
                assessment_id=assessment_id,
                set_number=set_number,
                questions=questions,
                total_marks=total_marks,
            )

            db.add(row)
            sets.append(row)

        # ----------------------------------------------------
        # COMMIT ALL NEW SETS
        # ----------------------------------------------------

        db.commit()

    except Exception:
        # Important:
        # If anything goes wrong during INSERT/COMMIT,
        # return the SQLAlchemy session to a clean state.
        db.rollback()
        raise

    # --------------------------------------------------------
    # REFRESH CREATED SETS
    # --------------------------------------------------------

    for s in sets:
        db.refresh(s)

    return sets