# from typing import List
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db
# from ..ai import matcher, interview_ai
# from ..notify import create_notification

# router = APIRouter(prefix="/api/applications", tags=["applications"])

# # ATS pipeline order — kept as the single source of truth for valid transitions
# PIPELINE_STAGES = ["ai_screening", "shortlisted", "assessment", "interview", "selected", "rejected"]


# @router.post("", response_model=schemas.ApplicationOut)
# def apply_to_job(
#     payload: schemas.ApplicationCreate,
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     job = db.query(models.Job).filter(models.Job.id == payload.job_id).first()
#     if not job or job.status != "open":
#         raise HTTPException(404, "Job not found or closed")

#     profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
#     if not profile or not profile.resume_text:
#         raise HTTPException(400, "Upload your resume before applying")

#     existing = db.query(models.Application).filter(
#         models.Application.job_id == job.id, models.Application.candidate_id == candidate.id
#     ).first()
#     if existing:
#         raise HTTPException(400, "Already applied to this job")

#     result = matcher.compute_match(
#         resume_text=profile.resume_text,
#         candidate_skills=profile.skills or [],
#         candidate_years=profile.years_experience or 0.0,
#         job_text=job.description,
#         required_skills=job.required_skills or [],
#         min_years=job.min_experience or 0.0,
#     )

#     questions = interview_ai.generate_questions(
#         matched_skills=result["matched_skills"],
#         missing_skills=result["missing_skills"],
#         years_experience=profile.years_experience or 0.0,
#         job_title=job.title,
#     )

#     # AI screening happens immediately on apply — status starts past "applied"
#     application = models.Application(
#         job_id=job.id,
#         candidate_id=candidate.id,
#         status="ai_screening",
#         match_score=result["match_score"],
#         match_breakdown=result["breakdown"],
#         matched_skills=result["matched_skills"],
#         missing_skills=result["missing_skills"],
#         interview_questions=questions,
#     )
#     db.add(application)
#     db.commit()
#     db.refresh(application)

#     create_notification(
#         db, candidate.id,
#         f"Application submitted for \"{job.title}\" — AI screening complete, match score {result['match_score']}%",
#         type="application_update", link_type="application", link_id=application.id,
#     )
#     create_notification(
#         db, job.recruiter_id,
#         f"New applicant for \"{job.title}\" — {candidate.full_name} scored {result['match_score']}%",
#         type="application_update", link_type="job", link_id=job.id,
#     )
#     return application


# @router.get("/mine", response_model=List[schemas.ApplicationOut])
# def my_applications(
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     return db.query(models.Application).filter(models.Application.candidate_id == candidate.id).order_by(
#         models.Application.applied_at.desc()
#     ).all()


# @router.patch("/{application_id}/status", response_model=schemas.ApplicationOut)
# def update_status(
#     application_id: int,
#     payload: schemas.ApplicationStatusUpdate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     if payload.status not in PIPELINE_STAGES:
#         raise HTTPException(400, f"status must be one of {PIPELINE_STAGES}")

#     application = db.query(models.Application).filter(models.Application.id == application_id).first()
#     if not application:
#         raise HTTPException(404, "Application not found")

#     job = db.query(models.Job).filter(models.Job.id == application.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     application.status = payload.status
#     db.commit()
#     db.refresh(application)

#     stage_labels = {
#         "ai_screening": "AI Screening", "shortlisted": "Shortlisted", "assessment": "Assessment",
#         "interview": "Interview", "selected": "Selected", "rejected": "Rejected",
#     }
#     create_notification(
#         db, application.candidate_id,
#         f"Your application for \"{job.title}\" moved to: {stage_labels.get(payload.status, payload.status)}",
#         type="application_update", link_type="application", link_id=application.id,
#     )
#     return application


# @router.get("/analytics/overview")
# def analytics_overview(
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     jobs = db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).all()
#     job_ids = [j.id for j in jobs]
#     apps = db.query(models.Application).filter(models.Application.job_id.in_(job_ids)).all() if job_ids else []

#     status_counts = {}
#     for a in apps:
#         status_counts[a.status] = status_counts.get(a.status, 0) + 1

#     avg_score = round(sum(a.match_score for a in apps) / len(apps), 1) if apps else 0.0

#     return {
#         "total_jobs": len(jobs),
#         "open_jobs": sum(1 for j in jobs if j.status == "open"),
#         "total_applications": len(apps),
#         "avg_match_score": avg_score,
#         "status_breakdown": status_counts,
#         "top_candidates": [
#             {"application_id": a.id, "job_id": a.job_id, "match_score": a.match_score}
#             for a in sorted(apps, key=lambda x: x.match_score, reverse=True)[:5]
#         ],
#     }











from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ai import matcher, interview_ai
from ..notify import create_notification

router = APIRouter(prefix="/api/applications", tags=["applications"])

# ATS pipeline order — kept as the single source of truth for valid transitions
PIPELINE_STAGES = ["ai_screening", "shortlisted", "assessment", "interview", "selected", "rejected"]


@router.post("", response_model=schemas.ApplicationOut)
def apply_to_job(
    payload: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    job = db.query(models.Job).filter(models.Job.id == payload.job_id).first()
    if not job or job.status != "open":
        raise HTTPException(404, "Job not found or closed")

    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
    if not profile or not profile.resume_text:
        raise HTTPException(400, "Upload your resume before applying")

    existing = db.query(models.Application).filter(
        models.Application.job_id == job.id, models.Application.candidate_id == candidate.id
    ).first()
    if existing:
        raise HTTPException(400, "Already applied to this job")

    result = matcher.compute_match(
        resume_text=profile.resume_text,
        candidate_skills=profile.skills or [],
        candidate_years=profile.years_experience or 0.0,
        job_text=job.description,
        required_skills=job.required_skills or [],
        min_years=job.min_experience or 0.0,
    )

    questions = interview_ai.generate_questions(
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        years_experience=profile.years_experience or 0.0,
        job_title=job.title,
    )

    # AI screening happens immediately on apply — status starts past "applied"
    application = models.Application(
        job_id=job.id,
        candidate_id=candidate.id,
        status="ai_screening",
        match_score=result["match_score"],
        match_breakdown=result["breakdown"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        interview_questions=questions,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    create_notification(
        db, candidate.id,
        f"Application submitted for \"{job.title}\" — AI screening complete, match score {result['match_score']}%",
        type="application_update", link_type="application", link_id=application.id,
    )
    create_notification(
        db, job.recruiter_id,
        f"New applicant for \"{job.title}\" — {candidate.full_name} scored {result['match_score']}%",
        type="application_update", link_type="job", link_id=job.id,
    )
    return application


@router.get("/mine", response_model=List[schemas.ApplicationOut])
def my_applications(
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    return db.query(models.Application).filter(models.Application.candidate_id == candidate.id).order_by(
        models.Application.applied_at.desc()
    ).all()


@router.delete("/{application_id}")
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    """
    Allows a candidate to withdraw an active job application.
    """
    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.candidate_id == candidate.id
    ).first()

    if not application:
        raise HTTPException(404, "Application not found")

    job = db.query(models.Job).filter(models.Job.id == application.job_id).first()

    # Clean up associated interview records if any exist
    if hasattr(models, 'Interview'):
        db.query(models.Interview).filter(models.Interview.application_id == application_id).delete(synchronize_session=False)

    # Clean up associated assessment submissions if any exist
    if hasattr(models, 'AssessmentSubmission'):
        db.query(models.AssessmentSubmission).filter(models.AssessmentSubmission.application_id == application_id).delete(synchronize_session=False)

    # Delete the application record
    db.delete(application)
    db.commit()

    # Notify the recruiter
    if job and job.recruiter_id:
        create_notification(
            db,
            job.recruiter_id,
            f"{candidate.full_name} has withdrawn their application for \"{job.title}\".",
            type="application_update",
            link_type="job",
            link_id=job.id,
        )

    return {"message": "Application withdrawn successfully", "id": application_id}


@router.patch("/{application_id}/status", response_model=schemas.ApplicationOut)
def update_status(
    application_id: int,
    payload: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    if payload.status not in PIPELINE_STAGES:
        raise HTTPException(400, f"status must be one of {PIPELINE_STAGES}")

    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(404, "Application not found")

    job = db.query(models.Job).filter(models.Job.id == application.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    application.status = payload.status
    db.commit()
    db.refresh(application)

    stage_labels = {
        "ai_screening": "AI Screening", "shortlisted": "Shortlisted", "assessment": "Assessment",
        "interview": "Interview", "selected": "Selected", "rejected": "Rejected",
    }
    create_notification(
        db, application.candidate_id,
        f"Your application for \"{job.title}\" moved to: {stage_labels.get(payload.status, payload.status)}",
        type="application_update", link_type="application", link_id=application.id,
    )
    return application


@router.get("/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).all()
    job_ids = [j.id for j in jobs]
    apps = db.query(models.Application).filter(models.Application.job_id.in_(job_ids)).all() if job_ids else []

    status_counts = {}
    for a in apps:
        status_counts[a.status] = status_counts.get(a.status, 0) + 1

    avg_score = round(sum(a.match_score for a in apps) / len(apps), 1) if apps else 0.0

    return {
        "total_jobs": len(jobs),
        "open_jobs": sum(1 for j in jobs if j.status == "open"),
        "total_applications": len(apps),
        "avg_match_score": avg_score,
        "status_breakdown": status_counts,
        "top_candidates": [
            {"application_id": a.id, "job_id": a.job_id, "match_score": a.match_score}
            for a in sorted(apps, key=lambda x: x.match_score, reverse=True)[:5]
        ],
    }