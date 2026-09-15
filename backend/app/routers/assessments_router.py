

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .. import models, schemas, auth
from .. import question_bank_models as qbm
from ..database import get_db
from ..ai import assessment_ai, code_executor
from ..notify import create_notification


router = APIRouter(
    prefix="/api/assessments",
    tags=["assessments"],
)


# ============================================================
# AUTO SUBMIT SECURITY EVENTS
# ============================================================

AUTO_SUBMIT_EVENTS = {
    "TAB_SWITCH",
    "FULLSCREEN_EXIT",
}


AUTO_SUBMIT_MESSAGES = {
    "TAB_SWITCH":
        "Assessment automatically submitted because you left the assessment tab.",

    "FULLSCREEN_EXIT":
        "Fullscreen mode exited. Your assessment was automatically submitted.",
}


# ============================================================
# EFFECTIVE QUESTIONS
# ============================================================

def _get_effective_questions(
    db: Session,
    submission: models.AssessmentSubmission,
    assessment: models.Assessment = None,
) -> list:
    """
    Returns the question list that THIS submission should actually use.

    If the submission has an AssessmentSetAssignment, the frozen
    AssessmentSet.questions snapshot is used.

    Otherwise the original Assessment.questions is used.
    """

    assignment = (
        db.query(qbm.AssessmentSetAssignment)
        .filter(
            qbm.AssessmentSetAssignment.submission_id
            == submission.id
        )
        .first()
    )

    if assignment:

        aset = (
            db.query(qbm.AssessmentSet)
            .filter(
                qbm.AssessmentSet.id
                == assignment.set_id
            )
            .first()
        )

        if aset:
            return aset.questions

    if assessment is None:

        assessment = (
            db.query(models.Assessment)
            .filter(
                models.Assessment.id
                == submission.assessment_id
            )
            .first()
        )

    return (
        assessment.questions
        if assessment
        else []
    )


# ============================================================
# SHARED SUBMISSION FINALIZATION
# ============================================================

def _finish_submission(
    db: Session,
    submission: models.AssessmentSubmission,
    assessment: models.Assessment,
    answers: dict,
    submission_type: str,
    terminated_reason: str,
):
    """
    Shared by manual submit and auto-submit.

    Uses the candidate's exact assigned set when one exists.
    """

    effective_questions = _get_effective_questions(
        db,
        submission,
        assessment,
    )

    questions_by_id = {
        q["id"]: q
        for q in effective_questions
    }

    for qid, ans in (answers or {}).items():

        if isinstance(ans, dict) and "code" in ans:

            q = questions_by_id.get(qid)

            if q and q.get("type") == "coding":

                lang = ans.get(
                    "language",
                    "python",
                )

                code = ans.get(
                    "code",
                    "",
                )

                try:

                    run_result = code_executor.run_code(
                        lang,
                        code,
                        q.get(
                            "hidden_test_cases"
                        ) or [],
                        q.get("input_pattern"),
                        q.get("output_pattern"),
                    )

                    ans["test_results"] = [
                        r["passed"]
                        for r in run_result.get(
                            "results",
                            [],
                        )
                    ]

                    ans["compile_error"] = (
                        run_result.get(
                            "compile_error"
                        )
                    )

                except Exception as e:

                    ans["test_results"] = None
                    ans["compile_error"] = str(e)

    result = assessment_ai.score_submission(
        effective_questions,
        answers,
    )

    submission.answers = answers

    submission.score = result["score_pct"]

    submission.max_score = result["max_score"]

    submission.per_question_feedback = (
        result["per_question_feedback"]
    )

    submission.status = "scored"

    submission.submission_type = (
        submission_type or "MANUAL"
    )

    submission.terminated_reason = (
        terminated_reason or ""
    )

    submission.submitted_at = datetime.utcnow()

    db.commit()

    db.refresh(submission)

    return result


# ============================================================
# FIND ACTIVE CODING QUESTION
# ============================================================

def _find_active_coding_question(
    db: Session,
    candidate: models.User,
    question_id: str,
):
    """
    Find a coding question from the candidate's active assessment.

    If the candidate has been assigned an exact AssessmentSet,
    the question is searched inside that exact set.
    """

    active_submissions = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.candidate_id
            == candidate.id,

            models.AssessmentSubmission.status
            == "in_progress",
        )
        .all()
    )

    question = None

    for sub in active_submissions:

        effective_questions = _get_effective_questions(
            db,
            sub,
        )

        for q in effective_questions:

            if q["id"] == question_id:

                question = q
                break

        if question:
            break

    if not question:

        raise HTTPException(
            404,
            "Question not found in any of your active assessments",
        )

    if question.get("type") != "coding":

        raise HTTPException(
            400,
            "This question is not a coding question",
        )

    return question


# ============================================================
# CREATE ASSESSMENT
# ============================================================

@router.post(
    "",
    response_model=schemas.AssessmentOut,
)
def create_assessment(
    payload: schemas.AssessmentCreate,

    db: Session = Depends(get_db),

    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == payload.job_id,
            models.Job.recruiter_id == recruiter.id,
        )
        .first()
    )

    if not job:

        raise HTTPException(
            404,
            "Job not found",
        )

    if payload.auto_generate:

        mix = (
            payload.question_mix
            or schemas.QuestionMix()
        )

        try:

            questions = (
                assessment_ai.generate_assessment_questions(
                    job.required_skills or [],
                    question_mix={
                        "mcq": mix.mcq,
                        "fill_blank": mix.fill_blank,
                        "coding": mix.coding,
                    },
                )
            )

        except AssertionError as e:

            raise HTTPException(
                500,
                f"Assessment generation failed validation: {e}",
            )

    else:

        if not payload.questions:

            raise HTTPException(
                400,
                "Provide questions or set auto_generate=true",
            )

        questions = []

        for q in payload.questions:

            d = q.model_dump()

            d["id"] = uuid.uuid4().hex[:8]

            questions.append(d)

    assessment = models.Assessment(
        job_id=job.id,
        title=payload.title,
        questions=questions,
    )

    db.add(assessment)

    db.commit()

    db.refresh(assessment)

    return assessment


# ============================================================
# LIST ASSESSMENTS FOR JOB
# ============================================================

@router.get(
    "/job/{job_id}",
    response_model=List[schemas.AssessmentOut],
)
def list_job_assessments(
    job_id: int,

    db: Session = Depends(get_db),

    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == job_id,
            models.Job.recruiter_id == recruiter.id,
        )
        .first()
    )

    if not job:

        raise HTTPException(
            404,
            "Job not found",
        )

    return (
        db.query(models.Assessment)
        .filter(
            models.Assessment.job_id == job_id
        )
        .all()
    )


# ============================================================
# ASSIGN NORMAL ASSESSMENT
# ============================================================

@router.post(
    "/{assessment_id}/assign",
    response_model=schemas.AssessmentSubmissionOut,
)
def assign_assessment(
    assessment_id: int,

    payload: schemas.AssessmentAssign,

    db: Session = Depends(get_db),

    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id
        )
        .first()
    )

    if not assessment:

        raise HTTPException(
            404,
            "Assessment not found",
        )

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id
            == payload.application_id
        )
        .first()
    )

    if not application:

        raise HTTPException(
            404,
            "Application not found",
        )

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == assessment.job_id,
            models.Job.recruiter_id == recruiter.id,
        )
        .first()
    )

    if (
        not job
        or application.job_id != job.id
    ):

        raise HTTPException(
            403,
            "Not your job posting",
        )

    existing = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.application_id
            == payload.application_id,
        )
        .first()
    )

    if existing:

        raise HTTPException(
            400,
            "Already assigned to this candidate",
        )

    submission = models.AssessmentSubmission(
        assessment_id=assessment_id,
        application_id=application.id,
        candidate_id=application.candidate_id,
        max_score=assessment.total_marks,
    )

    db.add(submission)

    application.status = "assessment"

    db.commit()

    db.refresh(submission)

    create_notification(
        db,
        application.candidate_id,
        f"You've been assigned an assessment: \"{assessment.title}\"",
        type="assessment",
        link_type="assessment",
        link_id=assessment.id,
    )

    return submission


# ============================================================
# ASSIGN EXACT RECRUITER-GENERATED SET
# ============================================================

@router.post(
    "/{assessment_id}/assign-set",
    response_model=schemas.AssessmentSubmissionOut,
)
def assign_assessment_set(
    assessment_id: int,

    payload: schemas.AssessmentSetAssign,

    db: Session = Depends(get_db),

    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    """
    Assign EXACTLY the recruiter-selected AssessmentSet.

    Request:

        POST /api/assessments/{assessment_id}/assign-set

        {
            "application_id": 123,
            "set_id": 3
        }

    This is intentionally different from
    /assign-random-set.

    The recruiter chooses the exact set and that set is permanently
    linked to the candidate's AssessmentSubmission through
    AssessmentSetAssignment.

    Candidate-facing endpoints use _get_effective_questions(),
    so the candidate will receive this exact set.
    """

    # --------------------------------------------------------
    # 1. Validate assessment
    # --------------------------------------------------------

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id
        )
        .first()
    )

    if not assessment:

        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    # --------------------------------------------------------
    # 2. Validate recruiter owns the assessment's job
    # --------------------------------------------------------

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == assessment.job_id,
            models.Job.recruiter_id == recruiter.id,
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=403,
            detail="Not your job posting",
        )

    # --------------------------------------------------------
    # 3. Validate application
    # --------------------------------------------------------

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id
            == payload.application_id
        )
        .first()
    )

    if not application:

        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    # --------------------------------------------------------
    # 4. Application must belong to the same job
    # --------------------------------------------------------

    if application.job_id != job.id:

        raise HTTPException(
            status_code=403,
            detail="This candidate does not belong to this job posting",
        )

    # --------------------------------------------------------
    # 5. Validate exact set
    # --------------------------------------------------------

    selected_set = (
        db.query(qbm.AssessmentSet)
        .filter(
            qbm.AssessmentSet.id
            == payload.set_id,

            qbm.AssessmentSet.assessment_id
            == assessment_id,
        )
        .first()
    )

    if not selected_set:

        raise HTTPException(
            status_code=404,
            detail=(
                "Assessment set not found for this assessment"
            ),
        )

    # --------------------------------------------------------
    # 6. Reuse-or-block existing submission
    #
    # CHANGED (bug fix): previously, ANY pre-existing
    # AssessmentSubmission for this (assessment_id,
    # application_id) pair -- even one with no exact set
    # attached yet, e.g. created earlier via the plain /assign
    # or /assign-random-set endpoints -- caused this endpoint
    # to unconditionally raise 400. That meant a recruiter
    # could never actually attach their hand-picked set once
    # *any* submission row already existed for that pair: the
    # request always failed with "Already assigned to this
    # candidate", and the candidate silently kept using the
    # generic Assessment.questions fallback in
    # _get_effective_questions instead of the exact set the
    # recruiter selected in the UI. That mismatch (recruiter
    # picks Set 2, candidate actually gets the base assessment
    # or a different set entirely) is the bug being fixed here.
    #
    # Fix: if a submission exists but has no set attached yet,
    # AND the candidate hasn't started/finished it, attach the
    # selected set to that same submission instead of blocking.
    # Only genuinely-conflicting cases (a set is already
    # attached, or the candidate already started/finished)
    # still return 400.
    # --------------------------------------------------------

    existing = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.application_id
            == application.id,
        )
        .first()
    )

    exact_max_score = float(
        selected_set.total_marks or 0
    )

    if existing:

        existing_set_assignment = (
            db.query(
                qbm.AssessmentSetAssignment
            )
            .filter(
                qbm.AssessmentSetAssignment.submission_id
                == existing.id
            )
            .first()
        )

        if existing_set_assignment:

            raise HTTPException(
                status_code=400,
                detail=(
                    "An assessment set is already assigned "
                    "to this candidate for this assessment"
                ),
            )

        if existing.status != "assigned":

            # Candidate already started (or was already scored)
            # on the generic assessment -- swapping the exact
            # set out from under them now would be unsafe.
            raise HTTPException(
                status_code=400,
                detail=(
                    "This candidate has already started or "
                    "completed this assessment, so an exact "
                    "set can no longer be attached to it."
                ),
            )

        # ----------------------------------------------------
        # Attach the exact set to the PRE-EXISTING submission
        # instead of creating a duplicate / rejecting outright.
        # ----------------------------------------------------

        submission = existing
        submission.max_score = exact_max_score

        set_assignment = qbm.AssessmentSetAssignment(
            submission_id=submission.id,
            set_id=selected_set.id,
        )

        db.add(set_assignment)

        application.status = "assessment"

        db.commit()
        db.refresh(submission)

        create_notification(
            db,
            application.candidate_id,
            (
                f"You've been assigned an assessment: "
                f"\"{assessment.title}\" "
                f"(Set {selected_set.set_number})"
            ),
            type="assessment",
            link_type="assessment",
            link_id=assessment.id,
        )

        return submission

    # --------------------------------------------------------
    # 7. Calculate exact set score (no prior submission)
    # --------------------------------------------------------

    # exact_max_score computed above, reused here.

    # --------------------------------------------------------
    # 8. Create assessment submission
    # --------------------------------------------------------

    submission = models.AssessmentSubmission(
        assessment_id=assessment_id,
        application_id=application.id,
        candidate_id=application.candidate_id,
        max_score=exact_max_score,
    )

    db.add(submission)

    # Flush first so submission.id is available for the
    # AssessmentSetAssignment foreign key.
    db.flush()

    # --------------------------------------------------------
    # 9. Permanently link the exact set to the submission
    # --------------------------------------------------------

    set_assignment = qbm.AssessmentSetAssignment(
        submission_id=submission.id,
        set_id=selected_set.id,
    )

    db.add(set_assignment)

    # --------------------------------------------------------
    # 10. Move candidate to Assessment stage
    # --------------------------------------------------------

    application.status = "assessment"

    # --------------------------------------------------------
    # 11. Commit everything atomically
    # --------------------------------------------------------

    db.commit()

    db.refresh(submission)

    # --------------------------------------------------------
    # 12. Notify candidate
    # --------------------------------------------------------

    create_notification(
        db,
        application.candidate_id,
        (
            f"You've been assigned an assessment: "
            f"\"{assessment.title}\" "
            f"(Set {selected_set.set_number})"
        ),
        type="assessment",
        link_type="assessment",
        link_id=assessment.id,
    )

    return submission


# ============================================================
# CANDIDATE ASSESSMENTS
# ============================================================

@router.get(
    "/mine",
    response_model=List[schemas.AssessmentSubmissionOut],
)
def my_assessments(
    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    rows = (
        db.query(
            models.AssessmentSubmission,
            models.Assessment,
            models.Job,
        )
        .join(
            models.Assessment,
            models.AssessmentSubmission.assessment_id
            == models.Assessment.id,
        )
        .join(
            models.Job,
            models.Assessment.job_id
            == models.Job.id,
        )
        .filter(
            models.AssessmentSubmission.candidate_id
            == candidate.id
        )
        .order_by(
            models.AssessmentSubmission.assigned_at.desc()
        )
        .all()
    )

    out = []

    for sub, assessment, job in rows:

        setattr(
            sub,
            "job_title",
            job.title,
        )

        setattr(
            sub,
            "assessment_title",
            assessment.title,
        )

        out.append(sub)

    return out


# ============================================================
# START SESSION
# ============================================================

@router.post(
    "/{assessment_id}/start-session",
    response_model=schemas.SessionStartOut,
)
def start_session(
    assessment_id: int,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if not submission:

        raise HTTPException(
            403,
            "This assessment hasn't been assigned to you",
        )

    if submission.status == "scored":

        raise HTTPException(
            400,
            "This assessment has already been submitted and cannot be restarted",
        )

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id
            == assessment_id
        )
        .first()
    )

    if not assessment:

        raise HTTPException(
            404,
            "Assessment not found",
        )

    if submission.status == "assigned":

        submission.status = "in_progress"

        submission.started_at = datetime.utcnow()

        submission.session_id = uuid.uuid4().hex

        submission.session_expires_at = (
            submission.started_at
            + timedelta(
                minutes=models.Assessment.DEFAULT_DURATION_MINUTES
            )
        )

        db.commit()

        db.refresh(submission)

    # IMPORTANT:
    # Exact recruiter-selected set is used here.

    effective_questions = _get_effective_questions(
        db,
        submission,
        assessment,
    )

    return schemas.SessionStartOut(
        session_id=submission.session_id,
        expires_at=submission.session_expires_at,
        current_question=submission.current_question or 0,
        answers=submission.answers or {},
        duration_minutes=models.Assessment.DEFAULT_DURATION_MINUTES,
        total_questions=len(effective_questions),
        total_marks=sum(
            q.get("marks", 1.0)
            for q in effective_questions
        ),
    )


# ============================================================
# HEARTBEAT
# ============================================================

@router.post(
    "/{assessment_id}/heartbeat",
    response_model=schemas.HeartbeatOut,
)
def heartbeat(
    assessment_id: int,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if (
        not submission
        or submission.status != "in_progress"
    ):

        return schemas.HeartbeatOut(
            valid=False
        )

    now = datetime.utcnow()

    if (
        submission.session_expires_at
        and now >= submission.session_expires_at
    ):

        assessment = (
            db.query(models.Assessment)
            .filter(
                models.Assessment.id
                == assessment_id
            )
            .first()
        )

        _finish_submission(
            db,
            submission,
            assessment,
            submission.answers or {},
            "TIMEOUT",
            "Time limit reached.",
        )

        return schemas.HeartbeatOut(
            valid=False
        )

    seconds_remaining = (
        int(
            (
                submission.session_expires_at
                - now
            ).total_seconds()
        )
        if submission.session_expires_at
        else None
    )

    return schemas.HeartbeatOut(
        valid=True,
        expires_at=submission.session_expires_at,
        seconds_remaining=seconds_remaining,
    )


# ============================================================
# AUTOSAVE
# ============================================================

@router.post(
    "/{assessment_id}/autosave"
)
def autosave(
    assessment_id: int,

    payload: schemas.AutosaveIn,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if (
        not submission
        or submission.status != "in_progress"
    ):

        raise HTTPException(
            403,
            "No active session for this assessment",
        )

    submission.answers = payload.answers

    submission.current_question = (
        payload.current_question or 0
    )

    db.commit()

    return {
        "saved": True
    }


# ============================================================
# SECURITY EVENT
# ============================================================

@router.post(
    "/{assessment_id}/security-event",
    response_model=schemas.SecurityEventOut,
)
def security_event(
    assessment_id: int,

    payload: schemas.SecurityEventIn,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if not submission:

        raise HTTPException(
            403,
            "This assessment hasn't been assigned to you",
        )

    event = models.SecurityEvent(
        submission_id=submission.id,
        candidate_id=candidate.id,
        event_type=payload.eventType,
        question_id=payload.questionId or "",
        metadata_json=payload.metadata or {},
    )

    db.add(event)

    if submission.status != "in_progress":

        db.commit()

        return schemas.SecurityEventOut(
            auto_submitted=False,
            violation_count=(
                submission.violation_count or 0
            ),
            message=(
                "Event logged "
                "(assessment already finalized)."
            ),
        )

    submission.violation_count = (
        submission.violation_count or 0
    ) + 1

    db.commit()

    if payload.eventType in AUTO_SUBMIT_EVENTS:

        assessment = (
            db.query(models.Assessment)
            .filter(
                models.Assessment.id
                == assessment_id
            )
            .first()
        )

        message = AUTO_SUBMIT_MESSAGES.get(
            payload.eventType,
            "Assessment automatically submitted due to a security violation.",
        )

        result = _finish_submission(
            db,
            submission,
            assessment,
            submission.answers or {},
            submission_type=(
                f"AUTO_{payload.eventType}"
            ),
            terminated_reason=message,
        )

        job = (
            db.query(models.Job)
            .filter(
                models.Job.id
                == assessment.job_id
            )
            .first()
        )

        if job:

            create_notification(
                db,
                job.recruiter_id,
                (
                    f"Candidate {candidate.full_name}'s "
                    f"assessment \"{assessment.title}\" "
                    f"was auto-submitted "
                    f"({payload.eventType})."
                ),
                type="assessment",
                link_type="application",
                link_id=submission.application_id,
            )

        return schemas.SecurityEventOut(
            auto_submitted=True,
            violation_count=(
                submission.violation_count
            ),
            final_score=result["score_pct"],
            message=message,
        )

    return schemas.SecurityEventOut(
        auto_submitted=False,
        violation_count=(
            submission.violation_count
        ),
        message="Violation logged.",
    )


# ============================================================
# GET QUESTIONS
# ============================================================

@router.get(
    "/{assessment_id}/questions",
    response_model=List[
        schemas.AssessmentQuestionPublic
    ],
)
def get_assessment_questions(
    assessment_id: int,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if not submission:

        raise HTTPException(
            403,
            "This assessment hasn't been assigned to you",
        )

    if submission.status == "scored":

        raise HTTPException(
            400,
            "This assessment has already been submitted",
        )

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id
        )
        .first()
    )

    if not assessment:

        raise HTTPException(
            404,
            "Assessment not found",
        )

    # Exact selected recruiter set is used here.

    effective_questions = _get_effective_questions(
        db,
        submission,
        assessment,
    )

    public_qs = []

    for q in effective_questions:

        public_qs.append(
            {
                "id": q["id"],
                "type": q["type"],
                "question": q["question"],
                "marks": q.get(
                    "marks",
                    1.0,
                ),
                "difficulty": q.get(
                    "difficulty",
                    "medium",
                ),
                "skill_tag": q.get(
                    "skill_tag",
                    "",
                ),
                "options": q.get(
                    "options"
                ),
                "problem_statement": q.get(
                    "problem_statement"
                ),
                "input_format": q.get(
                    "input_format"
                ),
                "output_format": q.get(
                    "output_format"
                ),
                "constraints": q.get(
                    "constraints"
                ),
                "examples": q.get(
                    "examples"
                ),
                "starter_code": q.get(
                    "starter_code"
                ),
                "allowed_languages": q.get(
                    "allowed_languages"
                ),
                "visible_test_cases": q.get(
                    "visible_test_cases"
                ),
                "time_limit_ms": q.get(
                    "time_limit_ms"
                ),
                "memory_limit_mb": q.get(
                    "memory_limit_mb"
                ),
                "hidden_test_count": len(
                    q.get(
                        "hidden_test_cases"
                    ) or []
                ),
            }
        )

    return public_qs


# ============================================================
# RUN CODE
# ============================================================

@router.post(
    "/code/run",
    response_model=schemas.CodeRunOut,
)
def run_code(
    payload: schemas.CodeRunIn,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    question = _find_active_coding_question(
        db,
        candidate,
        payload.questionId,
    )

    result = code_executor.run_code(
        payload.language,
        payload.code,
        question.get(
            "visible_test_cases"
        ) or [],
        question.get("input_pattern"),
        question.get("output_pattern"),
    )

    return schemas.CodeRunOut(
        **result
    )


# ============================================================
# EXECUTE CODE
# ============================================================

@router.post(
    "/code/execute",
    response_model=schemas.CodeRunOut,
)
def execute_code(
    payload: schemas.CodeRunIn,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    question = _find_active_coding_question(
        db,
        candidate,
        payload.questionId,
    )

    result = code_executor.run_code(
        payload.language,
        payload.code,
        question.get(
            "hidden_test_cases"
        ) or [],
        question.get("input_pattern"),
        question.get("output_pattern"),
    )

    sanitized_results = [
        {
            "passed": r.get(
                "passed",
                False,
            )
        }
        for r in result.get(
            "results",
            [],
        )
    ]

    return schemas.CodeRunOut(
        passed=result["passed"],
        total=result["total"],
        runtime=result["runtime"],
        results=sanitized_results,
        compile_error=result.get(
            "compile_error"
        ),
    )


# ============================================================
# SUBMIT ASSESSMENT
# ============================================================

@router.post(
    "/{assessment_id}/submit",
    response_model=schemas.AssessmentSubmissionOut,
)
def submit_assessment(
    assessment_id: int,

    payload: schemas.AssessmentAnswerIn,

    db: Session = Depends(get_db),

    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):

    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.assessment_id
            == assessment_id,

            models.AssessmentSubmission.candidate_id
            == candidate.id,
        )
        .first()
    )

    if not submission:

        raise HTTPException(
            403,
            "This assessment hasn't been assigned to you",
        )

    if submission.status == "scored":

        raise HTTPException(
            400,
            "Already submitted",
        )

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id
            == assessment_id
        )
        .first()
    )

    if not assessment:

        raise HTTPException(
            404,
            "Assessment not found",
        )

    result = _finish_submission(
        db,
        submission,
        assessment,
        payload.answers,
        submission_type=(
            payload.submission_type
            or "MANUAL"
        ),
        terminated_reason=(
            payload.terminated_reason
            or ""
        ),
    )

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id
            == assessment.job_id
        )
        .first()
    )

    if job:

        create_notification(
            db,
            job.recruiter_id,
            (
                f"Candidate {candidate.full_name} "
                f"scored {result['score_pct']}% "
                f"on \"{assessment.title}\""
            ),
            type="assessment",
            link_type="application",
            link_id=submission.application_id,
        )

    return submission


# ============================================================
# PROCTORING NOTE
# ============================================================
#
# Proctoring snapshot upload/serving endpoints are intentionally
# NOT defined here.
#
# They remain exclusively in monitor_router.py.
#
# ============================================================


# ============================================================
# SUBMISSIONS FOR APPLICATION
# ============================================================

@router.get(
    "/submissions/{application_id}",
    response_model=List[
        schemas.AssessmentSubmissionOut
    ],
)
def submissions_for_application(
    application_id: int,

    db: Session = Depends(get_db),

    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id
            == application_id
        )
        .first()
    )

    if not application:

        raise HTTPException(
            404,
            "Application not found",
        )

    job = (
        db.query(models.Job)
        .filter(
            models.Job.id == application.job_id,
            models.Job.recruiter_id
            == recruiter.id,
        )
        .first()
    )

    if not job:

        raise HTTPException(
            403,
            "Not your job posting",
        )

    return (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.application_id
            == application_id
        )
        .all()
    )











# ============================================================
# CANDIDATE SUBMISSION REPORT
# ============================================================

@router.get(
    "/submission/{submission_id}/report",
    response_model=schemas.AssessmentSubmissionOut,
)
def get_submission_report(
    submission_id: int,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):
    submission = (
        db.query(models.AssessmentSubmission)
        .filter(
            models.AssessmentSubmission.id == submission_id,
            models.AssessmentSubmission.candidate_id == candidate.id,
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            404,
            "Submission not found",
        )

    return submission