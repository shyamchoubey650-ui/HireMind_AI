
# """
# Question Bank + Assessment Sets API.

# Kept as its own router (same pattern as monitor_router.py alongside
# assessments_router.py) so none of the existing assessment endpoints
# need to be touched to add this. Shares the "/api/assessments" and a
# new "/api/questions" prefix; FastAPI has no problem with multiple
# routers sharing a prefix as long as paths don't collide, which these
# don't.
# """
# import uuid
# from typing import List, Optional
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from sqlalchemy import func

# from .. import models, schemas, auth, question_bank_models as qbm
# from ..database import get_db
# from ..ai import question_bank_ai as qb, set_generator
# from .assessments_router import assign_assessment as _assign_assessment

# router = APIRouter(tags=["question-bank"])


# # ============================================================
# # SCHEMAS (kept local to this router -- additive, doesn't touch
# # the shared schemas.py whose current full content hasn't been
# # shown in this conversation)
# # ============================================================

# class QuestionCreate(BaseModel):
#     job_id: int
#     question_type: str  # "mcq" | "fill_blank" | "coding"
#     question_text: str
#     difficulty: str = "medium"
#     topic: str = ""
#     skill: str = ""
#     marks: float = 1.0
#     explanation: str = ""
#     payload: dict = {}


# class QuestionUpdate(BaseModel):
#     question_text: Optional[str] = None
#     difficulty: Optional[str] = None
#     topic: Optional[str] = None
#     skill: Optional[str] = None
#     marks: Optional[float] = None
#     explanation: Optional[str] = None
#     payload: Optional[dict] = None


# class TestCaseCreate(BaseModel):
#     is_public: bool
#     input: str
#     expected_output: str


# class GenerateSetsIn(BaseModel):
#     job_id: int
#     required_skills: List[str] = []
#     num_sets: int
#     mcq_count: int
#     fill_blank_count: int
#     coding_count: int
#     # Spec section 17: default is NO REUSE. Only set true if the
#     # recruiter explicitly opts in after seeing an insufficient-pool
#     # error -- this is never silently enabled by the backend itself.
#     allow_controlled_reuse: bool = False


# class AvailabilityCheckIn(BaseModel):
#     job_id: int
#     required_skills: List[str] = []
#     num_sets: int
#     mcq_count: int
#     fill_blank_count: int
#     coding_count: int


# class AssignRandomSetIn(BaseModel):
#     application_id: int


# def _question_out(q: qbm.Question, include_private_tests: bool = False):
#     """
#     CHANGED: previously this checked `hasattr(q, "test_cases")`, which
#     was always False because question_bank_models.py had no reverse
#     relationship declared -- so include_private_tests=True silently did
#     nothing anywhere it was called. Question.test_cases is now a real
#     relationship (see question_bank_models.py), so this branch actually
#     works. No caller currently passes include_private_tests=True (this
#     stays recruiter-only by construction, since only recruiter-auth'd
#     endpoints call _question_out at all) -- but it's now correct if/when
#     one does.
#     """
#     test_cases = None
#     if include_private_tests:
#         test_cases = [
#             {"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output}
#             for tc in q.test_cases
#         ]
#     out = {
#         "id": q.id,
#         "job_id": q.job_id,
#         "question_type": q.question_type,
#         "question_text": q.question_text,
#         "difficulty": q.difficulty,
#         "topic": q.topic,
#         "skill": q.skill,
#         "marks": q.marks,
#         "explanation": q.explanation,
#         "payload": q.payload,
#         "source": q.source,
#         "created_at": q.created_at.isoformat() if q.created_at else None,
#         "updated_at": q.updated_at.isoformat() if q.updated_at else None,
#     }
#     if include_private_tests:
#         out["test_cases"] = test_cases
#     return out


# # ============================================================
# # PHASE 2 — QUESTION BANK CRUD (recruiter)
# # ============================================================

# @router.get("/api/questions")
# def list_questions(
#     job_id: int,
#     question_type: Optional[str] = None,
#     difficulty: Optional[str] = None,
#     skill: Optional[str] = None,
#     source: Optional[str] = None,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     query = db.query(qbm.Question).filter(qbm.Question.job_id == job_id)
#     if question_type:
#         query = query.filter(qbm.Question.question_type == question_type)
#     if difficulty:
#         query = query.filter(qbm.Question.difficulty == difficulty)
#     if skill:
#         query = query.filter(qbm.Question.skill == skill)
#     if source:
#         query = query.filter(qbm.Question.source == source)

#     return [_question_out(q) for q in query.order_by(qbm.Question.created_at.desc()).all()]


# @router.post("/api/questions")
# def create_question(
#     payload: QuestionCreate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     """Phase 7 backend: recruiter manually creates a question. Still
#     goes through the same duplicate check as AI-generated ones -- the
#     spec is explicit that recruiter-created questions must also be
#     checked against the bank.

#     CHANGED: 409 payload now includes an "options" array, matching the
#     shape generate_sets_endpoint's 409 already uses, per spec section 10
#     ("Use Existing Question" / "Edit Question" / "Add Anyway"). Note
#     this endpoint only ever returns the first two as real options --
#     "Add Anyway" isn't implemented as a bypass here (there's no
#     force=True param), so it's listed for frontend/UX parity but acting
#     on it requires a separate call your frontend would need to make
#     (e.g. hitting this same endpoint again with different text, or a
#     future explicit-override param). Flagging that gap rather than
#     quietly implying it's wired up.
#     """
#     job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     existing = qb.is_duplicate(db, payload.job_id, payload.question_text, payload.question_type)
#     if existing:
#         raise HTTPException(
#             409,
#             {
#                 "message": "Similar question already exists in the question bank.",
#                 "existing_question_id": existing.id,
#                 "existing_question_text": existing.question_text,
#                 "options": ["Use Existing Question", "Edit Question", "Add Anyway"],
#             },
#         )

#     row = qb.save_question(
#         db, job_id=payload.job_id, question_type=payload.question_type, question_text=payload.question_text,
#         payload=payload.payload, difficulty=payload.difficulty, topic=payload.topic, skill=payload.skill,
#         marks=payload.marks, explanation=payload.explanation, source="recruiter", created_by=recruiter.id,
#     )
#     return _question_out(row)


# @router.put("/api/questions/{question_id}")
# def update_question(
#     question_id: int,
#     payload: QuestionUpdate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
#     if not q:
#         raise HTTPException(404, "Question not found")
#     job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     data = payload.model_dump(exclude_unset=True)
#     if "question_text" in data:
#         q.normalized_text = qb.normalize_question(data["question_text"])
#     for field, value in data.items():
#         setattr(q, field, value)
#     db.commit()
#     db.refresh(q)
#     return _question_out(q)


# @router.delete("/api/questions/{question_id}")
# def delete_question(
#     question_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
#     if not q:
#         raise HTTPException(404, "Question not found")
#     job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.question_id == question_id).delete()
#     db.delete(q)
#     db.commit()
#     return {"deleted": True}


# # ============================================================
# # PHASE 8 — PUBLIC / PRIVATE TEST CASES (coding questions only)
# # ============================================================

# @router.post("/api/questions/{question_id}/test-cases")
# def add_test_case(
#     question_id: int,
#     payload: TestCaseCreate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
#     if not q:
#         raise HTTPException(404, "Question not found")
#     job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")
#     if q.question_type != "coding":
#         raise HTTPException(400, "Test cases only apply to coding questions")

#     tc = qbm.QuestionTestCase(
#         question_id=question_id, is_public=payload.is_public,
#         input=payload.input, expected_output=payload.expected_output,
#     )
#     db.add(tc)
#     db.commit()
#     db.refresh(tc)
#     return {"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output}


# @router.get("/api/questions/{question_id}/test-cases")
# def list_test_cases(
#     question_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     """Recruiter-only -- returns BOTH public and private test cases.
#     There is no candidate-facing equivalent of this endpoint; candidates
#     only ever see visible_test_cases already embedded in their assigned
#     set's question payload (see assessments_router.py), which is built
#     from public test cases only. Private test cases never have a
#     candidate-reachable code path THROUGH THIS ROUTER -- whether that
#     holds all the way through grading depends on code_executor.py and
#     _get_effective_questions, which haven't been reviewed yet."""
#     q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
#     if not q:
#         raise HTTPException(404, "Question not found")
#     job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     rows = db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.question_id == question_id).all()
#     return [{"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output} for tc in rows]


# @router.delete("/api/questions/test-cases/{test_case_id}")
# def delete_test_case(
#     test_case_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     tc = db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.id == test_case_id).first()
#     if not tc:
#         raise HTTPException(404, "Test case not found")
#     q = db.query(qbm.Question).filter(qbm.Question.id == tc.question_id).first()
#     job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first() if q else None
#     if not job:
#         raise HTTPException(403, "Not your job posting")
#     db.delete(tc)
#     db.commit()
#     return {"deleted": True}


# # ============================================================
# # PHASE 4 — AVAILABILITY PRE-CHECK
# # ============================================================

# @router.post("/api/assessments/{assessment_id}/sets/check-availability")
# def check_set_availability(
#     assessment_id: int,
#     payload: AvailabilityCheckIn,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
#     if not assessment:
#         raise HTTPException(404, "Assessment not found")
#     job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     return set_generator.check_availability(
#         db, payload.job_id, payload.required_skills, payload.num_sets,
#         payload.mcq_count, payload.fill_blank_count, payload.coding_count,
#     )


# # ============================================================
# # PHASE 4/6 — GENERATE SETS
# # ============================================================

# @router.post("/api/assessments/{assessment_id}/sets/generate")
# def generate_sets_endpoint(
#     assessment_id: int,
#     payload: GenerateSetsIn,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
#     if not assessment:
#         raise HTTPException(404, "Assessment not found")
#     job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")
#     if not (1 <= payload.num_sets <= 50):
#         raise HTTPException(400, "num_sets must be between 1 and 50")

#     try:
#         sets = set_generator.generate_sets(
#             db, assessment_id, payload.job_id, payload.required_skills, payload.num_sets,
#             payload.mcq_count, payload.fill_blank_count, payload.coding_count,
#             allow_controlled_reuse=payload.allow_controlled_reuse,
#         )
#     except set_generator.InsufficientQuestionsError as e:
#         options = ["Generate More Questions", "Reduce Number of Sets", "Reduce Questions Per Set"]
#         # Only offer this option if it wasn't ALREADY on (and still
#         # failed) -- if allow_controlled_reuse was true and we still
#         # got here, reuse alone couldn't close the gap either (e.g. not
#         # even one full set's worth of unique questions exists), so
#         # re-suggesting the same toggle would be misleading.
#         if not payload.allow_controlled_reuse:
#             options.append("Allow Controlled Reuse")
#         raise HTTPException(
#             409,
#             {
#                 "message": f"Unable to generate {payload.num_sets} fully unique assessment sets with the current question pool.",
#                 "question_type": e.question_type,
#                 "required": e.required,
#                 "available": e.available,
#                 "missing": e.missing,
#                 "options": options,
#             },
#         )

#     return {
#         "sets_created": len(sets),
#         "sets": [
#             {"id": s.id, "set_number": s.set_number, "question_count": len(s.questions), "total_marks": s.total_marks}
#             for s in sets
#         ],
#     }


# @router.get("/api/assessments/{assessment_id}/sets")
# def list_sets(
#     assessment_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
#     if not assessment:
#         raise HTTPException(404, "Assessment not found")
#     job = db.query(models.Job).filter(models.Job.id == assessment.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     rows = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.assessment_id == assessment_id).order_by(qbm.AssessmentSet.set_number).all()
#     return [
#         {"id": s.id, "set_number": s.set_number, "question_count": len(s.questions), "total_marks": s.total_marks}
#         for s in rows
#     ]


# @router.get("/api/assessments/{assessment_id}/sets/{set_id}")
# def get_set_detail(
#     assessment_id: int,
#     set_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     s = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.id == set_id, qbm.AssessmentSet.assessment_id == assessment_id).first()
#     if not s:
#         raise HTTPException(404, "Set not found")
#     assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
#     job = db.query(models.Job).filter(models.Job.id == assessment.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     return {"id": s.id, "set_number": s.set_number, "questions": s.questions, "total_marks": s.total_marks}


# # ============================================================
# # PHASE 11 — CANDIDATE SET ASSIGNMENT
# # ============================================================

# @router.post("/api/assessments/{assessment_id}/assign-random-set")
# def assign_random_set(
#     assessment_id: int,
#     payload: AssignRandomSetIn,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     """
#     Same as the existing POST /{assessment_id}/assign (reuses it
#     directly rather than re-implementing submission creation), plus:
#     picks a random AssessmentSet for this assessment that hasn't been
#     assigned to any other candidate yet, and links this submission to
#     it via AssessmentSetAssignment.

#     If no sets have been generated for this assessment (recruiter never
#     called /sets/generate), this behaves EXACTLY like the plain
#     /assign endpoint always has -- the candidate gets
#     Assessment.questions as before. Nothing about the existing
#     single-assessment flow changes for assessments that don't use sets.
#     """
#     submission = _assign_assessment(
#         assessment_id=assessment_id,
#         payload=schemas.AssessmentAssign(application_id=payload.application_id),
#         db=db,
#         recruiter=recruiter,
#     )

#     all_sets = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.assessment_id == assessment_id).all()
#     if not all_sets:
#         return submission  # no sets exist -- unchanged, existing behavior

#     used_set_ids = {
#         row.set_id for row in
#         db.query(qbm.AssessmentSetAssignment)
#         .join(qbm.AssessmentSet, qbm.AssessmentSetAssignment.set_id == qbm.AssessmentSet.id)
#         .filter(qbm.AssessmentSet.assessment_id == assessment_id)
#         .all()
#     }
#     available_sets = [s for s in all_sets if s.id not in used_set_ids]
#     # Every set already used at least once -- per spec ("do not assign
#     # the same set to the same candidate twice unless business logic
#     # requires it"), cycling back through all sets again is acceptable
#     # once every set has been used once; it's still random, just no
#     # longer guaranteed globally-unique once you exceed len(all_sets)
#     # candidates.
#     chosen_set = (available_sets or all_sets)[
#         int.from_bytes(uuid.uuid4().bytes[:4], "big") % len(available_sets or all_sets)
#     ]

#     assignment = qbm.AssessmentSetAssignment(submission_id=submission.id, set_id=chosen_set.id)
#     db.add(assignment)

#     # CHANGED: _assign_assessment() (called above) already set
#     # submission.max_score = assessment.total_marks -- but that's the
#     # ORIGINAL assessment's total, computed before we knew which set
#     # this candidate would get. Overwrite it with the actually-assigned
#     # set's total_marks now that chosen_set is known, so max_score
#     # matches what the candidate is really being graded against
#     # (matters whenever a set's total differs from the base assessment,
#     # e.g. different question counts/marks configured for sets vs. the
#     # original assessment).
#     submission.max_score = chosen_set.total_marks
#     db.commit()

#     return submission










"""
Question Bank + Assessment Sets API.

Kept as its own router (same pattern as monitor_router.py alongside
assessments_router.py) so none of the existing assessment endpoints
need to be touched to add this. Shares the "/api/assessments" and a
new "/api/questions" prefix; FastAPI has no problem with multiple
routers sharing a prefix as long as paths don't collide, which these
don't.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth, question_bank_models as qbm
from ..database import get_db
from ..ai import question_bank_ai as qb, set_generator
from .assessments_router import assign_assessment as _assign_assessment

router = APIRouter(tags=["question-bank"])


# ============================================================
# SCHEMAS
# ============================================================

class QuestionCreate(BaseModel):
    job_id: int
    question_type: str  # "mcq" | "fill_blank" | "coding"
    question_text: str
    difficulty: str = "medium"
    topic: str = ""
    skill: str = ""
    marks: float = 1.0
    explanation: str = ""
    payload: dict = {}


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    skill: Optional[str] = None
    marks: Optional[float] = None
    explanation: Optional[str] = None
    payload: Optional[dict] = None


class TestCaseCreate(BaseModel):
    is_public: bool
    input: str
    expected_output: str


class GenerateSetsIn(BaseModel):
    job_id: int
    required_skills: List[str] = []
    num_sets: int
    mcq_count: int
    fill_blank_count: int
    coding_count: int
    allow_controlled_reuse: bool = False


class AvailabilityCheckIn(BaseModel):
    job_id: int
    required_skills: List[str] = []
    num_sets: int
    mcq_count: int
    fill_blank_count: int
    coding_count: int


class AssignRandomSetIn(BaseModel):
    application_id: int


def _question_out(q: qbm.Question, include_private_tests: bool = False):
    test_cases = None
    if include_private_tests:
        test_cases = [
            {"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output}
            for tc in q.test_cases
        ]
    out = {
        "id": q.id,
        "job_id": q.job_id,
        "question_type": q.question_type,
        "question_text": q.question_text,
        "difficulty": q.difficulty,
        "topic": q.topic,
        "skill": q.skill,
        "marks": q.marks,
        "explanation": q.explanation,
        "payload": q.payload,
        "source": q.source,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "updated_at": q.updated_at.isoformat() if q.updated_at else None,
    }
    if include_private_tests:
        out["test_cases"] = test_cases
    return out


# ============================================================
# QUESTION BANK CRUD (recruiter)
# ============================================================

@router.get("/api/questions")
def list_questions(
    job_id: int,
    question_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    skill: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    query = db.query(qbm.Question).filter(qbm.Question.job_id == job_id)
    if question_type:
        query = query.filter(qbm.Question.question_type == question_type)
    if difficulty:
        query = query.filter(qbm.Question.difficulty == difficulty)
    if skill:
        query = query.filter(qbm.Question.skill == skill)
    if source:
        query = query.filter(qbm.Question.source == source)

    return [_question_out(q) for q in query.order_by(qbm.Question.created_at.desc()).all()]


@router.post("/api/questions")
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    existing = qb.is_duplicate(db, payload.job_id, payload.question_text, payload.question_type)
    if existing:
        raise HTTPException(
            409,
            {
                "message": "Similar question already exists in the question bank.",
                "existing_question_id": existing.id,
                "existing_question_text": existing.question_text,
                "options": ["Use Existing Question", "Edit Question", "Add Anyway"],
            },
        )

    row = qb.save_question(
        db, job_id=payload.job_id, question_type=payload.question_type, question_text=payload.question_text,
        payload=payload.payload, difficulty=payload.difficulty, topic=payload.topic, skill=payload.skill,
        marks=payload.marks, explanation=payload.explanation, source="recruiter", created_by=recruiter.id,
    )
    return _question_out(row)


@router.put("/api/questions/{question_id}")
def update_question(
    question_id: int,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    data = payload.model_dump(exclude_unset=True)
    if "question_text" in data:
        q.normalized_text = qb.normalize_question(data["question_text"])
    for field, value in data.items():
        setattr(q, field, value)
    db.commit()
    db.refresh(q)
    return _question_out(q)


@router.delete("/api/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.question_id == question_id).delete()
    db.delete(q)
    db.commit()
    return {"deleted": True}


# ============================================================
# PUBLIC / PRIVATE TEST CASES
# ============================================================

@router.post("/api/questions/{question_id}/test-cases")
def add_test_case(
    question_id: int,
    payload: TestCaseCreate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    q = db.query(qbm.Question).filter(qbm.Question.id == question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")
    if q.question_type != "coding":
        raise HTTPException(400, "Test cases only apply to coding questions")

    tc = qbm.QuestionTestCase(
        question_id=question_id, is_public=payload.is_public,
        input=payload.input, expected_output=payload.expected_output,
    )
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return {"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output}


@router.get("/api/questions/{question_id}/test-cases")
def list_test_cases(
    question_id: str,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    if str(question_id).isdigit():
        q_id_int = int(question_id)
        q = db.query(qbm.Question).filter(qbm.Question.id == q_id_int).first()
        if not q:
            return []
        
        job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first()
        if not job:
            raise HTTPException(403, "Not your job posting")

        rows = db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.question_id == q_id_int).all()
        return [{"id": tc.id, "is_public": tc.is_public, "input": tc.input, "expected_output": tc.expected_output} for tc in rows]
    
    return []


@router.delete("/api/questions/test-cases/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    tc = db.query(qbm.QuestionTestCase).filter(qbm.QuestionTestCase.id == test_case_id).first()
    if not tc:
        raise HTTPException(404, "Test case not found")
    q = db.query(qbm.Question).filter(qbm.Question.id == tc.question_id).first()
    job = db.query(models.Job).filter(models.Job.id == q.job_id, models.Job.recruiter_id == recruiter.id).first() if q else None
    if not job:
        raise HTTPException(403, "Not your job posting")
    db.delete(tc)
    db.commit()
    return {"deleted": True}


# ============================================================
# AVAILABILITY PRE-CHECK
# ============================================================

@router.post("/api/assessments/{assessment_id}/sets/check-availability")
def check_set_availability(
    assessment_id: int,
    payload: AvailabilityCheckIn,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    result = set_generator.check_availability(
        db, payload.job_id, payload.required_skills, payload.num_sets,
        payload.mcq_count, payload.fill_blank_count, payload.coding_count,
    )

    # Normalize response wrapper for frontend consumption
    if isinstance(result, dict):
        if "detail" not in result:
            return {
                "status": "success",
                "message": "Availability checked successfully",
                "detail": result
            }
        return result
    return {"detail": result}


# ============================================================
# GENERATE SETS
# ============================================================

@router.post("/api/assessments/{assessment_id}/sets/generate")
def generate_sets_endpoint(
    assessment_id: int,
    payload: GenerateSetsIn,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    job = db.query(models.Job).filter(models.Job.id == payload.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")
    if not (1 <= payload.num_sets <= 50):
        raise HTTPException(400, "num_sets must be between 1 and 50")

    try:
        sets = set_generator.generate_sets(
            db, assessment_id, payload.job_id, payload.required_skills, payload.num_sets,
            payload.mcq_count, payload.fill_blank_count, payload.coding_count,
            allow_controlled_reuse=payload.allow_controlled_reuse,
        )
    except set_generator.InsufficientQuestionsError as e:
        options = ["Generate More Questions", "Reduce Number of Sets", "Reduce Questions Per Set"]
        if not payload.allow_controlled_reuse:
            options.append("Allow Controlled Reuse")
        raise HTTPException(
            409,
            {
                "message": f"Unable to generate {payload.num_sets} fully unique assessment sets with the current question pool.",
                "question_type": e.question_type,
                "required": e.required,
                "available": e.available,
                "missing": e.missing,
                "options": options,
            },
        )

    return {
        "sets_created": len(sets),
        "sets": [
            {"id": s.id, "set_number": s.set_number, "question_count": len(s.questions), "total_marks": s.total_marks}
            for s in sets
        ],
    }


@router.get("/api/assessments/{assessment_id}/sets")
def list_sets(
    assessment_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    job = db.query(models.Job).filter(models.Job.id == assessment.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    rows = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.assessment_id == assessment_id).order_by(qbm.AssessmentSet.set_number).all()
    return [
        {"id": s.id, "set_number": s.set_number, "question_count": len(s.questions), "total_marks": s.total_marks}
        for s in rows
    ]


@router.get("/api/assessments/{assessment_id}/sets/{set_id}")
def get_set_detail(
    assessment_id: int,
    set_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    s = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.id == set_id, qbm.AssessmentSet.assessment_id == assessment_id).first()
    if not s:
        raise HTTPException(404, "Set not found")
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    job = db.query(models.Job).filter(models.Job.id == assessment.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    return {"id": s.id, "set_number": s.set_number, "questions": s.questions, "total_marks": s.total_marks}


# ============================================================
# DELETE ASSESSMENT SET
# ============================================================

@router.delete("/api/assessments/{assessment_id}/sets/{set_id}")
def delete_assessment_set(
    assessment_id: int,
    set_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    s = db.query(qbm.AssessmentSet).filter(
        qbm.AssessmentSet.id == set_id,
        qbm.AssessmentSet.assessment_id == assessment_id
    ).first()
    
    if not s:
        raise HTTPException(404, "Set not found")
        
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    job = db.query(models.Job).filter(models.Job.id == assessment.job_id, models.Job.recruiter_id == recruiter.id).first() if assessment else None
    if not job:
        raise HTTPException(403, "Not your job posting")

    db.query(qbm.AssessmentSetAssignment).filter(qbm.AssessmentSetAssignment.set_id == set_id).delete()
    db.delete(s)
    db.commit()
    return {"deleted": True, "message": "Set deleted successfully"}


# ============================================================
# CANDIDATE SET ASSIGNMENT
# ============================================================

@router.post("/api/assessments/{assessment_id}/assign-random-set")
def assign_random_set(
    assessment_id: int,
    payload: AssignRandomSetIn,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    submission = _assign_assessment(
        assessment_id=assessment_id,
        payload=schemas.AssessmentAssign(application_id=payload.application_id),
        db=db,
        recruiter=recruiter,
    )

    all_sets = db.query(qbm.AssessmentSet).filter(qbm.AssessmentSet.assessment_id == assessment_id).all()
    if not all_sets:
        return submission

    used_set_ids = {
        row.set_id for row in
        db.query(qbm.AssessmentSetAssignment)
        .join(qbm.AssessmentSet, qbm.AssessmentSetAssignment.set_id == qbm.AssessmentSet.id)
        .filter(qbm.AssessmentSet.assessment_id == assessment_id)
        .all()
    }
    available_sets = [s for s in all_sets if s.id not in used_set_ids]
    chosen_set = (available_sets or all_sets)[
        int.from_bytes(uuid.uuid4().bytes[:4], "big") % len(available_sets or all_sets)
    ]

    assignment = qbm.AssessmentSetAssignment(submission_id=submission.id, set_id=chosen_set.id)
    db.add(assignment)

    submission.max_score = chosen_set.total_marks
    db.commit()

    return submission