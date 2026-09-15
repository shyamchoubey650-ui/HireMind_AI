# from typing import List
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db

# router = APIRouter(prefix="/api/admin", tags=["admin"])


# @router.get("/users", response_model=List[schemas.UserOut])
# def list_users(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     return db.query(models.User).order_by(models.User.created_at.desc()).all()


# @router.patch("/users/{user_id}/deactivate", response_model=schemas.UserOut)
# def deactivate_user(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     user = db.query(models.User).filter(models.User.id == user_id).first()
#     if not user:
#         raise HTTPException(404, "User not found")
#     if user.role == "admin":
#         raise HTTPException(400, "Cannot deactivate an admin account")
#     user.is_active = False
#     db.commit()
#     db.refresh(user)
#     return user


# @router.patch("/users/{user_id}/activate", response_model=schemas.UserOut)
# def activate_user(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     user = db.query(models.User).filter(models.User.id == user_id).first()
#     if not user:
#         raise HTTPException(404, "User not found")
#     user.is_active = True
#     db.commit()
#     db.refresh(user)
#     return user


# @router.get("/jobs", response_model=List[schemas.JobOut])
# def all_jobs(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     jobs = db.query(models.Job).order_by(models.Job.created_at.desc()).all()

#     result = []
#     for job in jobs:
#         apps = db.query(models.Application).filter(models.Application.job_id == job.id).all()
#         applications_count = len(apps)
#         avg_match_score = round(sum(a.match_score for a in apps) / applications_count, 1) if applications_count else 0.0

#         result.append(schemas.JobOut(
#             id=job.id,
#             title=job.title,
#             description=job.description,
#             required_skills=job.required_skills,
#             min_experience=job.min_experience,
#             location=job.location,
#             status=job.status,
#             created_at=job.created_at,
#             recruiter_name=job.recruiter.full_name if job.recruiter else None,
#             recruiter_email=job.recruiter.email if job.recruiter else None,
#             applications_count=applications_count,
#             avg_match_score=avg_match_score,
#         ))
#     return result

# @router.get("/jobs/{job_id}/applicants", response_model=List[schemas.ApplicationOut])
# def admin_job_applicants(
#     job_id: int,
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     job = db.query(models.Job).filter(models.Job.id == job_id).first()
#     if not job:
#         raise HTTPException(404, "Job not found")

#     apps = db.query(models.Application).filter(models.Application.job_id == job_id).all()
#     ranked = sorted(apps, key=lambda a: a.match_score, reverse=True)
#     return ranked


# @router.get("/analytics/overview", response_model=schemas.AdminAnalyticsOut)
# def platform_analytics(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     total_users = db.query(models.User).count()
#     total_candidates = db.query(models.User).filter(models.User.role == "candidate").count()
#     total_recruiters = db.query(models.User).filter(models.User.role == "recruiter").count()
#     total_jobs = db.query(models.Job).count()
#     open_jobs = db.query(models.Job).filter(models.Job.status == "open").count()

#     apps = db.query(models.Application).all()
#     total_applications = len(apps)
#     avg_match_score = round(sum(a.match_score for a in apps) / len(apps), 1) if apps else 0.0

#     status_breakdown = {}
#     for a in apps:
#         status_breakdown[a.status] = status_breakdown.get(a.status, 0) + 1

#     total_interviews = db.query(models.Interview).count()
#     total_assessments_assigned = db.query(models.AssessmentSubmission).count()

#     return schemas.AdminAnalyticsOut(
#         total_users=total_users,
#         total_candidates=total_candidates,
#         total_recruiters=total_recruiters,
#         total_jobs=total_jobs,
#         open_jobs=open_jobs,
#         total_applications=total_applications,
#         avg_match_score=avg_match_score,
#         status_breakdown=status_breakdown,
#         total_interviews=total_interviews,
#         total_assessments_assigned=total_assessments_assigned,
#     )









from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "admin":
        raise HTTPException(400, "Cannot deactivate an admin account")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=schemas.UserOut)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.get("/jobs", response_model=List[schemas.JobOut])
def all_jobs(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    jobs = db.query(models.Job).order_by(models.Job.created_at.desc()).all()

    result = []
    for job in jobs:
        apps = db.query(models.Application).filter(models.Application.job_id == job.id).all()
        applications_count = len(apps)
        avg_match_score = round(sum(a.match_score for a in apps) / applications_count, 1) if applications_count else 0.0

        result.append(schemas.JobOut(
            id=job.id,
            title=job.title,
            description=job.description,
            required_skills=job.required_skills,
            min_experience=job.min_experience,
            location=job.location,
            status=job.status,
            created_at=job.created_at,
            recruiter_name=job.recruiter.full_name if job.recruiter else None,
            recruiter_email=job.recruiter.email if job.recruiter else None,
            applications_count=applications_count,
            avg_match_score=avg_match_score,
        ))
    return result


@router.get("/analytics/overview", response_model=schemas.AdminAnalyticsOut)
def platform_analytics(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    total_users = db.query(models.User).count()
    total_candidates = db.query(models.User).filter(models.User.role == "candidate").count()
    total_recruiters = db.query(models.User).filter(models.User.role == "recruiter").count()
    total_jobs = db.query(models.Job).count()
    open_jobs = db.query(models.Job).filter(models.Job.status == "open").count()

    apps = db.query(models.Application).all()
    total_applications = len(apps)
    avg_match_score = round(sum(a.match_score for a in apps) / len(apps), 1) if apps else 0.0

    status_breakdown = {}
    for a in apps:
        status_breakdown[a.status] = status_breakdown.get(a.status, 0) + 1

    total_interviews = db.query(models.Interview).count()
    total_assessments_assigned = db.query(models.AssessmentSubmission).count()

    return schemas.AdminAnalyticsOut(
        total_users=total_users,
        total_candidates=total_candidates,
        total_recruiters=total_recruiters,
        total_jobs=total_jobs,
        open_jobs=open_jobs,
        total_applications=total_applications,
        avg_match_score=avg_match_score,
        status_breakdown=status_breakdown,
        total_interviews=total_interviews,
        total_assessments_assigned=total_assessments_assigned,
    )


# @router.get("/applications", response_model=List[schemas.ApplicationOut])
# def all_admin_applications(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     """
#     Directly query all applications across all jobs for the admin overview.
#     """
#     apps = db.query(models.Application).order_by(models.Application.created_at.desc()).all()
#     result = []
#     for app in apps:
#         candidate = db.query(models.User).filter(models.User.id == app.candidate_id).first()
#         job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        
#         result.append(schemas.ApplicationOut(
#             id=app.id,
#             job_id=app.job_id,
#             candidate_id=app.candidate_id,
#             candidate_name=candidate.full_name if candidate else f"Candidate #{app.candidate_id}",
#             candidate_email=candidate.email if candidate else "",
#             job_title=job.title if job else f"Job #{app.job_id}",
#             status=app.status,
#             match_score=app.match_score,
#             matched_skills=app.matched_skills,
#             missing_skills=app.missing_skills,
#             match_breakdown=app.match_breakdown,
#             interview_questions=app.interview_questions,
#             created_at=app.created_at,
#         ))
#     return result


# @router.get("/interviews", response_model=List[schemas.InterviewOut])
# def all_admin_interviews(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     """
#     Returns all interviews across the platform for the admin overview dropdown.
#     """
#     return db.query(models.Interview).order_by(models.Interview.scheduled_at.desc()).all()





# @router.get("/applications")
# def all_admin_applications(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     apps = db.query(models.Application).all()
#     result = []
#     for app in apps:
#         candidate = db.query(models.User).filter(models.User.id == app.candidate_id).first()
#         job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
#         result.append({
#             "id": app.id,
#             "job_id": app.job_id,
#             "candidate_id": app.candidate_id,
#             "candidate_name": candidate.full_name if candidate else f"Candidate #{app.candidate_id}",
#             "candidate_email": candidate.email if candidate else "",
#             "job_title": job.title if job else f"Job #{app.job_id}",
#             "status": app.status,
#             "match_score": app.match_score,
#             "matched_skills": app.matched_skills or [],
#             "missing_skills": app.missing_skills or [],
#             "match_breakdown": app.match_breakdown or {},
#             "interview_questions": app.interview_questions or [],
#             "created_at": app.created_at.isoformat() if app.created_at else None
#         })
#     return result


# @router.get("/interviews")
# def all_admin_interviews(
#     db: Session = Depends(get_db),
#     admin: models.User = Depends(auth.require_role("admin")),
# ):
#     interviews = db.query(models.Interview).all()
#     result = []
#     for iv in interviews:
#         job = db.query(models.Job).filter(models.Job.id == iv.job_id).first() if hasattr(iv, 'job_id') else None
#         result.append({
#             "id": iv.id,
#             "application_id": iv.application_id,
#             "job_id": getattr(iv, 'job_id', None),
#             "interview_type": iv.interview_type,
#             "scheduled_at": iv.scheduled_at.isoformat() if iv.scheduled_at else None,
#             "status": iv.status,
#             "meeting_link": iv.meeting_link,
#             "notes": iv.notes
#         })
#     return result


@router.get("/applications")
def all_admin_applications(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    apps = db.query(models.Application).order_by(models.Application.applied_at.desc()).all()
    result = []
    for app in apps:
        candidate = db.query(models.User).filter(models.User.id == app.candidate_id).first()
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "candidate_id": app.candidate_id,
            "candidate_name": candidate.full_name if candidate else f"Candidate #{app.candidate_id}",
            "candidate_email": candidate.email if candidate else "",
            "job_title": job.title if job else f"Job #{app.job_id}",
            "status": app.status,
            "match_score": app.match_score,
            "matched_skills": app.matched_skills or [],
            "missing_skills": app.missing_skills or [],
            "match_breakdown": app.match_breakdown or {},
            "interview_questions": app.interview_questions or [],
            "applied_at": app.applied_at.isoformat() if app.applied_at else None
        })
    return result


@router.get("/interviews")
def all_admin_interviews(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role("admin")),
):
    interviews = db.query(models.Interview).order_by(models.Interview.scheduled_at.desc()).all()
    result = []
    for iv in interviews:
        job = db.query(models.Job).filter(models.Job.id == iv.job_id).first()
        result.append({
            "id": iv.id,
            "application_id": iv.application_id,
            "job_id": iv.job_id,
            "job_title": job.title if job else f"Job #{iv.job_id}",
            "interview_type": iv.interview_type,
            "scheduled_at": iv.scheduled_at.isoformat() if iv.scheduled_at else None,
            "status": iv.status,
            "meeting_link": iv.meeting_link,
            "notes": iv.notes
        })
    return result