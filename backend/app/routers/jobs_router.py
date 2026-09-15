
# from typing import List, Optional
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from sqlalchemy import cast, String

# from .. import models, schemas, auth
# from ..database import get_db
# from ..ai import resume_parser, matcher

# router = APIRouter(prefix="/api/jobs", tags=["jobs"])


# @router.post("", response_model=schemas.JobOut)
# def create_job(
#     payload: schemas.JobCreate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     parsed = resume_parser.parse_job_description(payload.description)
#     job = models.Job(
#         recruiter_id=recruiter.id,
#         title=payload.title,
#         description=payload.description,
#         required_skills=parsed["required_skills"],
#         min_experience=payload.min_experience or parsed["min_experience"],
#         location=payload.location,
#     )
#     db.add(job)
#     db.commit()
#     db.refresh(job)
#     return job


# @router.get("", response_model=List[schemas.JobOut])
# def list_jobs(
#     search: Optional[str] = Query(
#         None, description="Matches job title, description, required skills, or the posting recruiter's name"
#     ),
#     location: Optional[str] = Query(None, description="Case-insensitive substring match on job location"),
#     recruiter_id: Optional[int] = Query(
#         None, description="Only jobs posted by this recruiter — used by Choose Company to load one company's open jobs"
#     ),
#     min_experience_gte: Optional[float] = Query(None, description="Only jobs requiring at least this many years"),
#     max_experience: Optional[float] = Query(None, description="Only jobs requiring at most this many years"),
#     skip: int = Query(0, ge=0),
#     limit: Optional[int] = Query(None, ge=1, le=100),
#     db: Session = Depends(get_db),
# ):
#     """
#     Public listing — candidates browse open jobs.

#     All filters are optional and purely additive: calling this with no
#     query params returns exactly what it always has (every open job,
#     newest first) — existing callers (the candidate Browse Jobs page, the
#     admin All Jobs page) are unaffected. Added to support the Choose
#     Company feature's search/filtering without a second, duplicate
#     job-listing endpoint.
#     """
#     query = db.query(models.Job).filter(models.Job.status == "open")

#     if recruiter_id is not None:
#         query = query.filter(models.Job.recruiter_id == recruiter_id)

#     if min_experience_gte is not None:
#         query = query.filter(models.Job.min_experience >= min_experience_gte)

#     if max_experience is not None:
#         query = query.filter(models.Job.min_experience <= max_experience)

#     if location:
#         query = query.filter(models.Job.location.ilike(f"%{location}%"))

#     if search:
#         like = f"%{search}%"
#         query = query.join(models.User, models.Job.recruiter_id == models.User.id).filter(
#             models.Job.title.ilike(like)
#             | models.Job.description.ilike(like)
#             | models.User.full_name.ilike(like)
#             | cast(models.Job.required_skills, String).ilike(like)
#         )

#     query = query.order_by(models.Job.created_at.desc())
#     if skip:
#         query = query.offset(skip)
#     if limit:
#         query = query.limit(limit)
#     return query.all()


# @router.get("/mine", response_model=List[schemas.JobOut])
# def my_jobs(
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     return db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).order_by(models.Job.created_at.desc()).all()


# @router.get("/{job_id}", response_model=schemas.JobOut)
# def get_job(job_id: int, db: Session = Depends(get_db)):
#     job = db.query(models.Job).filter(models.Job.id == job_id).first()
#     if not job:
#         raise HTTPException(404, "Job not found")
#     return job


# @router.get("/{job_id}/applicants", response_model=List[schemas.ApplicationOut])
# def ranked_applicants(
#     job_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.get_current_user),
# ):
#     job = db.query(models.Job).filter(models.Job.id == job_id).first()
#     if not job:
#         raise HTTPException(404, "Job not found")

#     apps = db.query(models.Application).filter(models.Application.job_id == job_id).all()
#     ranked = sorted(apps, key=lambda a: a.match_score or 0.0, reverse=True)

#     result = []
#     for app in ranked:
#         candidate = db.query(models.User).filter(models.User.id == app.candidate_id).first()
#         result.append(schemas.ApplicationOut(
#             id=app.id,
#             job_id=app.job_id,
#             candidate_id=app.candidate_id,
#             candidate_name=candidate.full_name if candidate else f"Candidate #{app.candidate_id}",
#             candidate_email=candidate.email if candidate else "",
#             status=app.status,
#             match_score=app.match_score or 0.0,
#             match_breakdown=app.match_breakdown or {},
#             matched_skills=app.matched_skills or [],
#             missing_skills=app.missing_skills or [],
#             interview_questions=app.interview_questions or [],
#             applied_at=app.applied_at,
#         ))
#     return result


# @router.patch("/{job_id}/close", response_model=schemas.JobOut)
# def close_job(
#     job_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(404, "Job not found")
#     job.status = "closed"
#     db.commit()
#     db.refresh(job)
#     return job

























from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import cast, String

from .. import models, schemas, auth
from ..database import get_db
from ..ai import resume_parser, matcher

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("", response_model=schemas.JobOut)
def create_job(
    payload: schemas.JobCreate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    parsed = resume_parser.parse_job_description(payload.description)
    job = models.Job(
        recruiter_id=recruiter.id,
        title=payload.title,
        description=payload.description,
        required_skills=parsed["required_skills"],
        min_experience=payload.min_experience or parsed["min_experience"],
        location=payload.location,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=List[schemas.JobOut])
def list_jobs(
    search: Optional[str] = Query(
        None, description="Matches job title, description, required skills, or the posting recruiter's name"
    ),
    location: Optional[str] = Query(None, description="Case-insensitive substring match on job location"),
    recruiter_id: Optional[int] = Query(
        None, description="Only jobs posted by this recruiter — used by Choose Company to load one company's open jobs"
    ),
    min_experience_gte: Optional[float] = Query(None, description="Only jobs requiring at least this many years"),
    max_experience: Optional[float] = Query(None, description="Only jobs requiring at most this many years"),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Job).filter(models.Job.status == "open")

    if recruiter_id is not None:
        query = query.filter(models.Job.recruiter_id == recruiter_id)

    if min_experience_gte is not None:
        query = query.filter(models.Job.min_experience >= min_experience_gte)

    if max_experience is not None:
        query = query.filter(models.Job.min_experience <= max_experience)

    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))

    if search:
        like = f"%{search}%"
        query = query.join(models.User, models.Job.recruiter_id == models.User.id).filter(
            models.Job.title.ilike(like)
            | models.Job.description.ilike(like)
            | models.User.full_name.ilike(like)
            | cast(models.Job.required_skills, String).ilike(like)
        )

    query = query.order_by(models.Job.created_at.desc())
    if skip:
        query = query.offset(skip)
    if limit:
        query = query.limit(limit)
    return query.all()


@router.get("/mine", response_model=List[schemas.JobOut])
def my_jobs(
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    return db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).order_by(models.Job.created_at.desc()).all()


@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.patch("/{job_id}", response_model=schemas.JobOut)
def update_job(
    job_id: int,
    payload: schemas.JobUpdate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(404, "Job not found or unauthorized")

    update_data = payload.model_dump(exclude_unset=True)
    if "description" in update_data and update_data["description"]:
        parsed = resume_parser.parse_job_description(update_data["description"])
        job.required_skills = parsed["required_skills"]

    for field, val in update_data.items():
        setattr(job, field, val)

    db.commit()
    db.refresh(job)
    return job


@router.get("/{job_id}/applicants", response_model=List[schemas.ApplicationOut])
def ranked_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    apps = db.query(models.Application).filter(models.Application.job_id == job_id).all()
    ranked = sorted(apps, key=lambda a: a.match_score or 0.0, reverse=True)

    result = []
    for app in ranked:
        candidate = db.query(models.User).filter(models.User.id == app.candidate_id).first()
        result.append(schemas.ApplicationOut(
            id=app.id,
            job_id=app.job_id,
            candidate_id=app.candidate_id,
            candidate_name=candidate.full_name if candidate else f"Candidate #{app.candidate_id}",
            candidate_email=candidate.email if candidate else "",
            status=app.status,
            match_score=app.match_score or 0.0,
            match_breakdown=app.match_breakdown or {},
            matched_skills=app.matched_skills or [],
            missing_skills=app.missing_skills or [],
            interview_questions=app.interview_questions or [],
            applied_at=app.applied_at,
        ))
    return result


@router.patch("/{job_id}/close", response_model=schemas.JobOut)
def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    job.status = "closed"
    db.commit()
    db.refresh(job)
    return job