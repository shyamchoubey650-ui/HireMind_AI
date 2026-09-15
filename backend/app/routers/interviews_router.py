# from typing import List
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db
# from ..notify import create_notification

# router = APIRouter(prefix="/api/interviews", tags=["interviews"])


# @router.post("", response_model=schemas.InterviewOut)
# def schedule_interview(
#     payload: schemas.InterviewCreate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     application = db.query(models.Application).filter(models.Application.id == payload.application_id).first()
#     if not application:
#         raise HTTPException(404, "Application not found")

#     job = db.query(models.Job).filter(models.Job.id == application.job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(403, "Not your job posting")

#     interview = models.Interview(
#         application_id=application.id,
#         job_id=job.id,
#         candidate_id=application.candidate_id,
#         recruiter_id=recruiter.id,
#         interview_type=payload.interview_type,
#         scheduled_at=payload.scheduled_at,
#         meeting_link=payload.meeting_link,
#         notes=payload.notes,
#     )
#     db.add(interview)
#     application.status = "interview"
#     db.commit()
#     db.refresh(interview)

#     create_notification(
#         db, application.candidate_id,
#         f"Interview scheduled for \"{job.title}\" on {payload.scheduled_at.strftime('%d %b %Y, %I:%M %p')}",
#         type="interview", link_type="interview", link_id=interview.id,
#     )
#     return interview


# @router.get("/mine", response_model=List[schemas.InterviewOut])
# def my_interviews(
#     db: Session = Depends(get_db),
#     user: models.User = Depends(auth.require_any_role("candidate", "recruiter")),
# ):
#     q = db.query(models.Interview)
#     if user.role == "candidate":
#         q = q.filter(models.Interview.candidate_id == user.id)
#     else:
#         q = q.filter(models.Interview.recruiter_id == user.id)
#     return q.order_by(models.Interview.scheduled_at.asc()).all()


# @router.get("/job/{job_id}", response_model=List[schemas.InterviewOut])
# def job_interviews(
#     job_id: int,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
#     if not job:
#         raise HTTPException(404, "Job not found")
#     return db.query(models.Interview).filter(models.Interview.job_id == job_id).order_by(models.Interview.scheduled_at.asc()).all()


# @router.patch("/{interview_id}", response_model=schemas.InterviewOut)
# def update_interview(
#     interview_id: int,
#     payload: schemas.InterviewUpdate,
#     db: Session = Depends(get_db),
#     recruiter: models.User = Depends(auth.require_role("recruiter")),
# ):
#     interview = db.query(models.Interview).filter(
#         models.Interview.id == interview_id, models.Interview.recruiter_id == recruiter.id
#     ).first()
#     if not interview:
#         raise HTTPException(404, "Interview not found")

#     data = payload.model_dump(exclude_unset=True)
#     for key, value in data.items():
#         setattr(interview, key, value)
#     db.commit()
#     db.refresh(interview)

#     if "status" in data or "feedback" in data:
#         create_notification(
#             db, interview.candidate_id,
#             f"Your interview status was updated to '{interview.status}'",
#             type="interview", link_type="interview", link_id=interview.id,
#         )
#     return interview












from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..notify import create_notification

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


class RescheduleRequest(BaseModel):
    preferred_time_1: str
    preferred_time_2: Optional[str] = None
    reason: str


class RecruiterRescheduleAccept(BaseModel):
    new_scheduled_at: datetime
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


@router.post("", response_model=schemas.InterviewOut)
def schedule_interview(
    payload: schemas.InterviewCreate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    application = db.query(models.Application).filter(models.Application.id == payload.application_id).first()
    if not application:
        raise HTTPException(404, "Application not found")

    job = db.query(models.Job).filter(models.Job.id == application.job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(403, "Not your job posting")

    interview = models.Interview(
        application_id=application.id,
        job_id=job.id,
        candidate_id=application.candidate_id,
        recruiter_id=recruiter.id,
        interview_type=payload.interview_type,
        scheduled_at=payload.scheduled_at,
        meeting_link=payload.meeting_link,
        notes=payload.notes,
        status="scheduled",
    )
    db.add(interview)
    application.status = "interview"
    db.commit()
    db.refresh(interview)

    create_notification(
        db, application.candidate_id,
        f"Interview scheduled for \"{job.title}\" on {payload.scheduled_at.strftime('%d %b %Y, %I:%M %p')}",
        type="interview", link_type="interview", link_id=interview.id,
    )
    return interview


@router.get("/mine", response_model=List[schemas.InterviewOut])
def my_interviews(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_any_role("candidate", "recruiter")),
):
    q = db.query(models.Interview)
    if user.role == "candidate":
        q = q.filter(models.Interview.candidate_id == user.id)
    else:
        q = q.filter(models.Interview.recruiter_id == user.id)
    return q.order_by(models.Interview.scheduled_at.asc()).all()


@router.get("/job/{job_id}", response_model=List[schemas.InterviewOut])
def job_interviews(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return db.query(models.Interview).filter(models.Interview.job_id == job_id).order_by(models.Interview.scheduled_at.asc()).all()


@router.post("/{interview_id}/reschedule-request")
def request_reschedule(
    interview_id: int,
    payload: RescheduleRequest,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    """
    Candidate submits a reschedule request. 
    Updates interview status to 'reschedule_requested' and adds proposed slots into notes.
    """
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.candidate_id == candidate.id
    ).first()
    if not interview:
        raise HTTPException(404, "Interview not found")

    job = db.query(models.Job).filter(models.Job.id == interview.job_id).first()
    recruiter_id = interview.recruiter_id or (job.recruiter_id if job else None)

    # Update status so it highlights on the recruiter's screen
    interview.status = "reschedule_requested"
    
    note_details = f"[RESCHEDULE REQUEST]\nReason: {payload.reason}\nSlot 1: {payload.preferred_time_1}"
    if payload.preferred_time_2:
        note_details += f"\nSlot 2: {payload.preferred_time_2}"

    interview.notes = f"{interview.notes}\n\n{note_details}" if interview.notes else note_details
    db.commit()
    db.refresh(interview)

    if recruiter_id:
        create_notification(
            db,
            recruiter_id,
            f"Candidate {candidate.full_name} requested to reschedule interview for '{job.title if job else 'Job'}'. Reason: {payload.reason}",
            type="interview_reschedule",
            link_type="interview",
            link_id=interview.id,
        )

    return {"message": "Reschedule request sent to recruiter", "interview": interview}


@router.patch("/{interview_id}", response_model=schemas.InterviewOut)
def update_interview(
    interview_id: int,
    payload: schemas.InterviewUpdate,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(auth.require_role("recruiter")),
):
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id, models.Interview.recruiter_id == recruiter.id
    ).first()
    if not interview:
        raise HTTPException(404, "Interview not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(interview, key, value)
    db.commit()
    db.refresh(interview)

    if "status" in data or "feedback" in data or "scheduled_at" in data:
        create_notification(
            db, interview.candidate_id,
            f"Your interview schedule was updated to: {interview.status} on {interview.scheduled_at.strftime('%d %b %Y, %I:%M %p') if interview.scheduled_at else ''}",
            type="interview", link_type="interview", link_id=interview.id,
        )
    return interview