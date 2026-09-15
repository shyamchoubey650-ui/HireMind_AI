


# """
# Persistent Question Bank + Assessment Sets.

# Added as a SEPARATE module (not merged into models.py) following this
# project's existing pattern (monitor_router.py added routes without
# touching assessments_router.py; ProctorSnapshot was added via
# migrate_proctoring.py). These classes share the same declarative Base
# as everything in models.py, so SQLAlchemy treats them as part of the
# same schema -- they just don't require editing a models.py whose exact
# current content (post every migration script in this repo) hasn't been
# shown in this conversation. That's the safest way to add persistence
# without risking the existing, working assessment system.

# Run migrate_question_bank.py once to create these tables.

# CHANGE (this revision): Question.test_cases / QuestionTestCase.question
# now use back_populates on BOTH sides. Previously only
# QuestionTestCase.question was declared, so SQLAlchemy created no
# reverse accessor -- question_bank_router.py's `hasattr(q, "test_cases")`
# was always False and its private-test-case-inclusion branch was dead
# code. This is now a real, queryable relationship.
# """
# from sqlalchemy import (
#     Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean, JSON, UniqueConstraint
# )
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from .database import Base


# class Question(Base):
#     """
#     One question in the persistent, reusable question bank. Both
#     AI-generated and recruiter-created questions live here -- `source`
#     distinguishes them ("ai" | "recruiter").

#     Scoped to a job (job_id) rather than global: uniqueness and "how
#     many are available" only make sense relative to the skill set a
#     given job is testing -- a Python question shouldn't block
#     generation for an unrelated Java job.
#     """
#     __tablename__ = "question_bank"

#     id = Column(Integer, primary_key=True, index=True)
#     job_id = Column(Integer, ForeignKey("jobs.id"), index=True)

#     question_type = Column(String, nullable=False)  # "mcq" | "fill_blank" | "coding"
#     question_text = Column(Text, nullable=False)
#     # Lowercased / whitespace-collapsed / punctuation-stripped version of
#     # question_text (see ai/question_bank_ai.py normalize_question()).
#     # Indexed for fast exact/normalized duplicate lookups without
#     # re-normalizing every existing row on every check.
#     normalized_text = Column(String, nullable=False, index=True)

#     difficulty = Column(String, default="medium")
#     topic = Column(String, default="")
#     skill = Column(String, default="", index=True)
#     marks = Column(Float, default=1.0)
#     explanation = Column(Text, default="")

#     # Type-specific payload (options/correct_answer for mcq,
#     # expected_answer/accepted_answers for fill_blank, full coding
#     # problem spec for coding) kept as JSON rather than a dozen nullable
#     # columns -- consistent with Assessment.questions already being
#     # stored as JSON in models.py.
#     payload = Column(JSON, default=dict)

#     source = Column(String, default="ai")  # "ai" | "recruiter"
#     created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     job = relationship("Job")

#     # CHANGED: back_populates added (was implicit/one-sided before).
#     # cascade="all, delete-orphan" means deleting a Question also
#     # deletes its QuestionTestCase rows -- matches delete_question()'s
#     # existing manual .delete() call in question_bank_router.py, so
#     # behavior doesn't change, it's just now also enforced at the ORM
#     # level if anything ever deletes a Question a different way.
#     test_cases = relationship(
#         "QuestionTestCase",
#         back_populates="question",
#         cascade="all, delete-orphan",
#     )

#     __table_args__ = (
#         UniqueConstraint("job_id", "normalized_text", name="uq_question_job_normtext"),
#     )


# class QuestionTestCase(Base):
#     """
#     Public or private test case for a coding Question. Public test
#     cases are safe to send to candidates; private ones must NEVER leave
#     the backend -- enforced in question_bank_router.py by simply never
#     serializing is_public=False rows into any candidate-facing response.
#     """
#     __tablename__ = "question_test_cases"

#     id = Column(Integer, primary_key=True, index=True)
#     question_id = Column(Integer, ForeignKey("question_bank.id"), index=True)
#     is_public = Column(Boolean, default=False)
#     input = Column(Text, default="")
#     expected_output = Column(Text, default="")
#     created_at = Column(DateTime, default=datetime.utcnow)

#     # CHANGED: back_populates added to match Question.test_cases above.
#     question = relationship("Question", back_populates="test_cases")


# class AssessmentSet(Base):
#     """
#     One of up to 50 parallel, non-overlapping variants of an assessment.

#     `questions` is a frozen snapshot in the SAME shape as
#     Assessment.questions (list of dicts, each with a generated "id") --
#     this is what the candidate-facing pipeline reads once a submission
#     is linked to a set (see assessments_router.py's
#     _get_effective_questions), so scoring, code execution, and
#     security-event question_id linkage all keep working unmodified.
#     """
#     __tablename__ = "assessment_sets"

#     id = Column(Integer, primary_key=True, index=True)
#     assessment_id = Column(Integer, ForeignKey("assessments.id"), index=True)
#     set_number = Column(Integer, nullable=False)  # 1..N within this assessment
#     questions = Column(JSON, default=list)
#     total_marks = Column(Float, default=0.0)
#     created_at = Column(DateTime, default=datetime.utcnow)

#     assessment = relationship("Assessment")

#     __table_args__ = (
#         UniqueConstraint("assessment_id", "set_number", name="uq_set_assessment_number"),
#     )


# class AssessmentSetAssignment(Base):
#     """
#     Which AssessmentSet a given AssessmentSubmission was assigned.

#     A separate table rather than a new column on AssessmentSubmission
#     so this ships without touching models.py at all -- the existing
#     AssessmentSubmission table and ORM class are completely untouched.
#     One row per submission (unique constraint) since each candidate
#     attempt maps to exactly one set.
#     """
#     __tablename__ = "assessment_set_assignments"

#     id = Column(Integer, primary_key=True, index=True)
#     submission_id = Column(Integer, ForeignKey("assessment_submissions.id"), unique=True, index=True)
#     set_id = Column(Integer, ForeignKey("assessment_sets.id"), index=True)
#     assigned_at = Column(DateTime, default=datetime.utcnow)





























"""
Persistent Question Bank + Assessment Sets.

Added as a SEPARATE module (not merged into models.py) following this
project's existing pattern (monitor_router.py added routes without
touching assessments_router.py; ProctorSnapshot was added via
migrate_proctoring.py). These classes share the same declarative Base
as everything in models.py, so SQLAlchemy treats them as part of the
same schema -- they just don't require editing a models.py whose exact
current content (post every migration script in this repo) hasn't been
shown in this conversation. That's the safest way to add persistence
without risking the existing, working assessment system.

Run migrate_question_bank.py once to create these tables.

CHANGE (this revision): Question.test_cases / QuestionTestCase.question
now use back_populates on BOTH sides. Previously only
QuestionTestCase.question was declared, so SQLAlchemy created no
reverse accessor -- question_bank_router.py's `hasattr(q, "test_cases")`
was always False and its private-test-case-inclusion branch was dead
code. This is now a real, queryable relationship.
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Question(Base):
    """
    One question in the persistent, reusable question bank. Both
    AI-generated and recruiter-created questions live here -- `source`
    distinguishes them ("ai" | "recruiter").

    Scoped to a job (job_id) rather than global: uniqueness and "how
    many are available" only make sense relative to the skill set a
    given job is testing -- a Python question shouldn't block
    generation for an unrelated Java job.
    """
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True)

    question_type = Column(String, nullable=False)  # "mcq" | "fill_blank" | "coding"
    question_text = Column(Text, nullable=False)
    # Lowercased / whitespace-collapsed / punctuation-stripped version of
    # question_text (see ai/question_bank_ai.py normalize_question()).
    # Indexed for fast exact/normalized duplicate lookups without
    # re-normalizing every existing row on every check.
    normalized_text = Column(String, nullable=False, index=True)

    difficulty = Column(String, default="medium")
    topic = Column(String, default="")
    skill = Column(String, default="", index=True)
    marks = Column(Float, default=1.0)
    explanation = Column(Text, default="")

    # Type-specific payload (options/correct_answer for mcq,
    # expected_answer/accepted_answers for fill_blank, full coding
    # problem spec for coding) kept as JSON rather than a dozen nullable
    # columns -- consistent with Assessment.questions already being
    # stored as JSON in models.py.
    payload = Column(JSON, default=dict)

    source = Column(String, default="ai")  # "ai" | "recruiter"
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job")

    # CHANGED: back_populates added (was implicit/one-sided before).
    # cascade="all, delete-orphan" means deleting a Question also
    # deletes its QuestionTestCase rows -- matches delete_question()'s
    # existing manual .delete() call in question_bank_router.py, so
    # behavior doesn't change, it's just now also enforced at the ORM
    # level if anything ever deletes a Question a different way.
    test_cases = relationship(
        "QuestionTestCase",
        back_populates="question",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("job_id", "normalized_text", name="uq_question_job_normtext"),
    )


class QuestionTestCase(Base):
    """
    Public or private test case for a coding Question. Public test
    cases are safe to send to candidates; private ones must NEVER leave
    the backend -- enforced in question_bank_router.py by simply never
    serializing is_public=False rows into any candidate-facing response.
    """
    __tablename__ = "question_test_cases"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("question_bank.id"), index=True)
    is_public = Column(Boolean, default=False)
    input = Column(Text, default="")
    expected_output = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # CHANGED: back_populates added to match Question.test_cases above.
    question = relationship("Question", back_populates="test_cases")


class AssessmentSet(Base):
    """
    One of up to 50 parallel, non-overlapping variants of an assessment.

    `questions` is a frozen snapshot in the SAME shape as
    Assessment.questions (list of dicts, each with a generated "id") --
    this is what the candidate-facing pipeline reads once a submission
    is linked to a set (see assessments_router.py's
    _get_effective_questions), so scoring, code execution, and
    security-event question_id linkage all keep working unmodified.
    """
    __tablename__ = "assessment_sets"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), index=True)
    set_number = Column(Integer, nullable=False)  # 1..N within this assessment
    questions = Column(JSON, default=list)
    total_marks = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("Assessment")

    __table_args__ = (
        UniqueConstraint("assessment_id", "set_number", name="uq_set_assessment_number"),
    )


class AssessmentSetAssignment(Base):
    """
    Which AssessmentSet a given AssessmentSubmission was assigned.

    A separate table rather than a new column on AssessmentSubmission
    so this ships without touching models.py at all -- the existing
    AssessmentSubmission table and ORM class are completely untouched.
    One row per submission (unique constraint) since each candidate
    attempt maps to exactly one set.
    """
    __tablename__ = "assessment_set_assignments"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("assessment_submissions.id"), unique=True, index=True)
    set_id = Column(Integer, ForeignKey("assessment_sets.id"), index=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
