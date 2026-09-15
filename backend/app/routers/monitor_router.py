# """
# HireMind AI - Recruiter Proctoring Monitor

# Provides:

# 1. Candidate camera snapshots
# 2. Security-event timeline
# 3. Backend-authoritative risk scoring
# 4. Violation -> nearest camera snapshot matching
# 5. Recruiter review / flagging

# Important:
# Risk is ALWAYS calculated by risk_engine.py.

# The frontend must NEVER calculate risk points.
# """

# import os
# import uuid
# from datetime import datetime
# from typing import Optional

# from fastapi import (
#     APIRouter,
#     Depends,
#     HTTPException,
#     UploadFile,
#     File,
#     Form,
# )
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# from sqlalchemy.orm import Session

# from .. import models, auth
# from ..database import get_db
# from ..ai import risk_engine


# router = APIRouter(
#     prefix="/api/assessments",
#     tags=["proctoring"],
# )


# # ============================================================
# # CONFIGURATION
# # ============================================================

# # monitor_router.py:
# #
# # backend/app/routers/monitor_router.py
# #
# # Go:
# #
# # monitor_router.py
# #       ↓
# # routers
# #       ↓
# # app
# #       ↓
# # backend
# #
# # Therefore:
# #
# # backend/uploads/proctoring
# #
# BASE_DIR = os.path.abspath(
#     os.path.join(
#         os.path.dirname(__file__),
#         "..",
#         "..",
#     )
# )


# UPLOAD_ROOT = os.path.join(
#     BASE_DIR,
#     "uploads",
#     "proctoring",
# )


# os.makedirs(
#     UPLOAD_ROOT,
#     exist_ok=True,
# )


# MAX_SNAPSHOT_BYTES = 3 * 1024 * 1024

# SNAPSHOT_MATCH_SECONDS = 10


# # ============================================================
# # REVIEW MODEL
# # ============================================================

# class SecurityEventReview(BaseModel):
#     review_status: str
#     recruiter_notes: Optional[str] = ""


# # ============================================================
# # HELPERS
# # ============================================================

# def _iso(value):
#     """
#     Safely convert datetime to ISO string.
#     """

#     if not value:
#         return None

#     if isinstance(value, datetime):
#         return value.isoformat()

#     return str(value)


# def _snapshot_to_dict(snapshot):
#     """
#     Convert ProctorSnapshot database object
#     into recruiter JSON.

#     IMPORTANT:
#     Return ONLY the API-relative path.

#     DO NOT return:

#         http://localhost:8000/api/...

#     because the frontend already has API_BASE.

#     Correct returned value:

#         /assessments/proctor-snapshot/62/file.jpg

#     If frontend has:

#         API_BASE = http://localhost:8000/api

#     then:

#         API_BASE + snapshot.url

#     becomes:

#         http://localhost:8000/api/assessments/proctor-snapshot/62/file.jpg

#     which is correct.
#     """

#     filename = os.path.basename(
#         snapshot.file_path
#     )

#     url = (
#         f"/assessments/"
#         f"proctor-snapshot/"
#         f"{snapshot.submission_id}/"
#         f"{filename}"
#     )

#     return {
#         "id": snapshot.id,

#         "submission_id": snapshot.submission_id,

#         "question_id": (
#             snapshot.question_id
#             or ""
#         ),

#         "filename": filename,

#         "url": url,

#         "captured_at": _iso(
#             snapshot.captured_at
#         ),
#     }


# def _event_to_dict(event):
#     """
#     Convert SecurityEvent database object
#     into recruiter JSON.
#     """

#     scoring = risk_engine.score_event(
#         event.event_type
#     )

#     return {
#         "id": event.id,

#         "event_type": event.event_type,

#         "question_id": (
#             event.question_id
#             or ""
#         ),

#         "metadata": (
#             event.metadata_json
#             or {}
#         ),

#         "created_at": _iso(
#             event.created_at
#         ),

#         "severity": scoring["severity"],

#         "risk_points": scoring["points"],

#         "label": scoring["label"],

#         "review_status": (
#             event.review_status
#             or "unreviewed"
#         ),

#         "recruiter_notes": (
#             event.recruiter_notes
#             or ""
#         ),
#     }


# def _find_nearest_snapshot(
#     event,
#     snapshots,
# ):
#     """
#     Find camera snapshot closest to security event.
#     """

#     if not event.created_at:
#         return None

#     closest = None

#     closest_seconds = None

#     for snapshot in snapshots:

#         if not snapshot.captured_at:
#             continue

#         difference = abs(
#             (
#                 snapshot.captured_at
#                 - event.created_at
#             ).total_seconds()
#         )

#         if (
#             closest_seconds is None
#             or difference < closest_seconds
#         ):

#             closest = snapshot

#             closest_seconds = difference

#     if (
#         closest is None
#         or closest_seconds > SNAPSHOT_MATCH_SECONDS
#     ):

#         return None

#     return closest


# # ============================================================
# # OWNERSHIP
# # ============================================================

# def _get_owned_submission(
#     db: Session,
#     application_id: int,
#     recruiter: models.User,
# ):
#     """
#     Make sure recruiter owns application/job.
#     """

#     application = (
#         db.query(models.Application)
#         .filter(
#             models.Application.id
#             == application_id
#         )
#         .first()
#     )

#     if not application:

#         raise HTTPException(
#             404,
#             "Application not found",
#         )

#     job = (
#         db.query(models.Job)
#         .filter(
#             models.Job.id
#             == application.job_id,

#             models.Job.recruiter_id
#             == recruiter.id,
#         )
#         .first()
#     )

#     if not job:

#         raise HTTPException(
#             403,
#             "Not your job posting",
#         )

#     submission = (
#         db.query(
#             models.AssessmentSubmission
#         )
#         .filter(
#             models.AssessmentSubmission.application_id
#             == application_id
#         )
#         .order_by(
#             models.AssessmentSubmission.id.desc()
#         )
#         .first()
#     )

#     if not submission:

#         raise HTTPException(
#             404,
#             "No assessment submission for this application",
#         )

#     return submission


# # ============================================================
# # CANDIDATE SNAPSHOT UPLOAD
# # ============================================================

# @router.post(
#     "/{assessment_id}/proctor-snapshot"
# )
# async def upload_proctor_snapshot(
#     assessment_id: int,

#     file: UploadFile = File(...),

#     question_id: str = Form(""),

#     db: Session = Depends(get_db),

#     candidate: models.User = Depends(
#         auth.require_role("candidate")
#     ),
# ):
#     """
#     Candidate-side camera snapshot upload.

#     Every uploaded frame is stored as a ProctorSnapshot.
#     """

#     submission = (
#         db.query(
#             models.AssessmentSubmission
#         )
#         .filter(
#             models.AssessmentSubmission.assessment_id
#             == assessment_id,

#             models.AssessmentSubmission.candidate_id
#             == candidate.id,
#         )
#         .first()
#     )

#     if not submission:

#         raise HTTPException(
#             403,
#             "This assessment hasn't been assigned to you",
#         )

#     if submission.status != "in_progress":

#         return {
#             "saved": False,
#             "reason": "submission not in progress",
#         }

#     contents = await file.read()

#     if len(contents) > MAX_SNAPSHOT_BYTES:

#         raise HTTPException(
#             413,
#             "Snapshot too large",
#         )

#     if not contents:

#         raise HTTPException(
#             400,
#             "Empty snapshot",
#         )

#     # --------------------------------------------------------
#     # PHYSICAL DIRECTORY
#     # --------------------------------------------------------

#     submission_dir = os.path.join(
#         UPLOAD_ROOT,
#         str(submission.id),
#     )

#     os.makedirs(
#         submission_dir,
#         exist_ok=True,
#     )

#     # --------------------------------------------------------
#     # FILE NAME
#     # --------------------------------------------------------

#     filename = (
#         f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}_"
#         f"{uuid.uuid4().hex[:8]}.jpg"
#     )

#     absolute_path = os.path.join(
#         submission_dir,
#         filename,
#     )

#     # --------------------------------------------------------
#     # WRITE FILE
#     # --------------------------------------------------------

#     with open(
#         absolute_path,
#         "wb",
#     ) as f:

#         f.write(contents)

#     # --------------------------------------------------------
#     # DATABASE PATH
#     # --------------------------------------------------------

#     relative_path = (
#         f"proctoring/"
#         f"{submission.id}/"
#         f"{filename}"
#     )

#     snapshot = models.ProctorSnapshot(
#         submission_id=submission.id,

#         candidate_id=candidate.id,

#         question_id=question_id or "",

#         file_path=relative_path,
#     )

#     db.add(snapshot)

#     db.commit()

#     db.refresh(snapshot)

#     return {
#         "saved": True,

#         "snapshot": _snapshot_to_dict(
#             snapshot
#         ),
#     }


# # ============================================================
# # SNAPSHOT IMAGE SERVING
# # ============================================================

# @router.get(
#     "/proctor-snapshot/{submission_id}/{filename}"
# )
# def get_proctor_snapshot(
#     submission_id: int,

#     filename: str,

#     db: Session = Depends(get_db),

#     recruiter: models.User = Depends(
#         auth.require_role("recruiter")
#     ),
# ):
#     """
#     Serve a stored proctoring snapshot.

#     Physical storage:

#         backend/uploads/proctoring/<submission_id>/<filename>

#     API:

#         /api/assessments/proctor-snapshot/<submission_id>/<filename>
#     """

#     # --------------------------------------------------------
#     # FIND SUBMISSION
#     # --------------------------------------------------------

#     submission = (
#         db.query(
#             models.AssessmentSubmission
#         )
#         .filter(
#             models.AssessmentSubmission.id
#             == submission_id
#         )
#         .first()
#     )

#     if not submission:

#         raise HTTPException(
#             404,
#             "Submission not found",
#         )

#     # --------------------------------------------------------
#     # FIND APPLICATION
#     # --------------------------------------------------------

#     application = (
#         db.query(models.Application)
#         .filter(
#             models.Application.id
#             == submission.application_id
#         )
#         .first()
#     )

#     if not application:

#         raise HTTPException(
#             404,
#             "Application not found",
#         )

#     # --------------------------------------------------------
#     # VERIFY RECRUITER OWNS JOB
#     # --------------------------------------------------------

#     job = (
#         db.query(models.Job)
#         .filter(
#             models.Job.id
#             == application.job_id,

#             models.Job.recruiter_id
#             == recruiter.id,
#         )
#         .first()
#     )

#     if not job:

#         raise HTTPException(
#             403,
#             "Not your job posting",
#         )

#     # --------------------------------------------------------
#     # PREVENT PATH TRAVERSAL
#     # --------------------------------------------------------

#     safe_filename = os.path.basename(
#         filename
#     )

#     if not safe_filename:

#         raise HTTPException(
#             400,
#             "Invalid filename",
#         )

#     # --------------------------------------------------------
#     # FIND SNAPSHOT DATABASE RECORD
#     # --------------------------------------------------------

#     snapshots = (
#         db.query(
#             models.ProctorSnapshot
#         )
#         .filter(
#             models.ProctorSnapshot.submission_id
#             == submission_id
#         )
#         .all()
#     )

#     snapshot = None

#     for item in snapshots:

#         stored_filename = os.path.basename(
#             item.file_path
#         )

#         if stored_filename == safe_filename:

#             snapshot = item

#             break

#     if not snapshot:

#         raise HTTPException(
#             404,
#             "Snapshot not found",
#         )

#     # --------------------------------------------------------
#     # PHYSICAL FILE PATH
#     # --------------------------------------------------------

#     absolute_path = os.path.join(
#         UPLOAD_ROOT,
#         str(submission_id),
#         safe_filename,
#     )

#     # --------------------------------------------------------
#     # VERIFY FILE EXISTS
#     # --------------------------------------------------------

#     if not os.path.isfile(
#         absolute_path
#     ):

#         raise HTTPException(
#             404,
#             "Snapshot file not found on disk",
#         )

#     # --------------------------------------------------------
#     # RETURN IMAGE
#     # --------------------------------------------------------

#     return FileResponse(
#         absolute_path,
#         media_type="image/jpeg",
#         filename=safe_filename,
#         headers={
#             "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
#             "Pragma": "no-cache",
#         },
#     )


# # ============================================================
# # MAIN RECRUITER PROCTORING ENDPOINT
# # ============================================================

# @router.get(
#     "/submissions/{application_id}/proctoring"
# )
# def get_proctoring_monitor(
#     application_id: int,

#     db: Session = Depends(get_db),

#     recruiter: models.User = Depends(
#         auth.require_role("recruiter")
#     ),
# ):
#     """
#     SINGLE endpoint used by ProctoringMonitor.jsx.
#     """

#     submission = _get_owned_submission(
#         db,
#         application_id,
#         recruiter,
#     )

#     # --------------------------------------------------------
#     # SECURITY EVENTS
#     # --------------------------------------------------------

#     events = (
#         db.query(
#             models.SecurityEvent
#         )
#         .filter(
#             models.SecurityEvent.submission_id
#             == submission.id
#         )
#         .order_by(
#             models.SecurityEvent.created_at.asc()
#         )
#         .all()
#     )

#     # --------------------------------------------------------
#     # CAMERA SNAPSHOTS
#     # --------------------------------------------------------

#     snapshots = (
#         db.query(
#             models.ProctorSnapshot
#         )
#         .filter(
#             models.ProctorSnapshot.submission_id
#             == submission.id
#         )
#         .order_by(
#             models.ProctorSnapshot.captured_at.asc()
#         )
#         .all()
#     )

#     # --------------------------------------------------------
#     # BACKEND RISK
#     # --------------------------------------------------------

#     scored_events = []

#     for event in events:

#         scoring = risk_engine.score_event(
#             event.event_type
#         )

#         scored_events.append(
#             {
#                 "risk_points": scoring["points"]
#             }
#         )

#     risk = risk_engine.aggregate_risk(
#         scored_events
#     )

#     # --------------------------------------------------------
#     # EVENT TIMELINE
#     # --------------------------------------------------------

#     out_events = []

#     for event in events:

#         event_data = _event_to_dict(
#             event
#         )

#         matched_snapshot = (
#             _find_nearest_snapshot(
#                 event,
#                 snapshots,
#             )
#         )

#         if matched_snapshot:

#             event_data["snapshot"] = (
#                 _snapshot_to_dict(
#                     matched_snapshot
#                 )
#             )

#             if (
#                 matched_snapshot.captured_at
#                 and event.created_at
#             ):

#                 event_data[
#                     "snapshot_time_difference"
#                 ] = round(
#                     abs(
#                         (
#                             matched_snapshot.captured_at
#                             - event.created_at
#                         ).total_seconds()
#                     ),
#                     2,
#                 )

#             else:

#                 event_data[
#                     "snapshot_time_difference"
#                 ] = None

#         else:

#             event_data["snapshot"] = None

#             event_data[
#                 "snapshot_time_difference"
#             ] = None

#         out_events.append(
#             event_data
#         )

#     # --------------------------------------------------------
#     # CANDIDATE
#     # --------------------------------------------------------

#     candidate_name = None

#     if submission.candidate:

#         candidate_name = (
#             submission.candidate.full_name
#         )

#     # --------------------------------------------------------
#     # RESPONSE
#     # --------------------------------------------------------

#     return {
#         "application_id": application_id,

#         "candidate_name": candidate_name,

#         "submission_id": submission.id,

#         "attempt_status": submission.status,

#         "submission_type": (
#             submission.submission_type
#             or ""
#         ),

#         "score": submission.score,

#         "max_score": submission.max_score,

#         "violation_count": (
#             submission.violation_count
#             or 0
#         ),

#         "terminated_reason": (
#             submission.terminated_reason
#             or ""
#         ),

#         "risk_score": risk["score"],

#         "risk_band": risk["band"],

#         "events": out_events,

#         "snapshots": [
#             _snapshot_to_dict(
#                 snapshot
#             )
#             for snapshot in snapshots
#         ],
#     }


# # ============================================================
# # SNAPSHOT LIST
# # ============================================================

# @router.get(
#     "/submissions/{application_id}/proctor-snapshots"
# )
# def list_proctor_snapshots(
#     application_id: int,

#     db: Session = Depends(get_db),

#     recruiter: models.User = Depends(
#         auth.require_role("recruiter")
#     ),
# ):
#     """
#     Return all candidate camera snapshots.
#     """

#     submission = _get_owned_submission(
#         db,
#         application_id,
#         recruiter,
#     )

#     snapshots = (
#         db.query(
#             models.ProctorSnapshot
#         )
#         .filter(
#             models.ProctorSnapshot.submission_id
#             == submission.id
#         )
#         .order_by(
#             models.ProctorSnapshot.captured_at.asc()
#         )
#         .all()
#     )

#     return [
#         _snapshot_to_dict(
#             snapshot
#         )
#         for snapshot in snapshots
#     ]


# # ============================================================
# # SECURITY EVENT LIST
# # ============================================================

# @router.get(
#     "/submissions/{application_id}/security-events"
# )
# def list_security_events(
#     application_id: int,

#     db: Session = Depends(get_db),

#     recruiter: models.User = Depends(
#         auth.require_role("recruiter")
#     ),
# ):
#     """
#     Return security-event timeline.
#     """

#     submission = _get_owned_submission(
#         db,
#         application_id,
#         recruiter,
#     )

#     events = (
#         db.query(
#             models.SecurityEvent
#         )
#         .filter(
#             models.SecurityEvent.submission_id
#             == submission.id
#         )
#         .order_by(
#             models.SecurityEvent.created_at.asc()
#         )
#         .all()
#     )

#     snapshots = (
#         db.query(
#             models.ProctorSnapshot
#         )
#         .filter(
#             models.ProctorSnapshot.submission_id
#             == submission.id
#         )
#         .order_by(
#             models.ProctorSnapshot.captured_at.asc()
#         )
#         .all()
#     )

#     scored_events = []

#     out_events = []

#     for event in events:

#         scoring = risk_engine.score_event(
#             event.event_type
#         )

#         scored_events.append(
#             {
#                 "risk_points": scoring["points"]
#             }
#         )

#         event_data = _event_to_dict(
#             event
#         )

#         matched_snapshot = (
#             _find_nearest_snapshot(
#                 event,
#                 snapshots,
#             )
#         )

#         if matched_snapshot:

#             event_data["snapshot"] = (
#                 _snapshot_to_dict(
#                     matched_snapshot
#                 )
#             )

#         else:

#             event_data["snapshot"] = None

#         out_events.append(
#             event_data
#         )

#     risk = risk_engine.aggregate_risk(
#         scored_events
#     )

#     return {
#         "submission_status": submission.status,

#         "violation_count": (
#             submission.violation_count
#             or 0
#         ),

#         "risk_score": risk["score"],

#         "risk_band": risk["band"],

#         "events": out_events,
#     }


# # ============================================================
# # RECRUITER REVIEW
# # ============================================================

# @router.patch(
#     "/security-events/{event_id}/review"
# )
# def review_security_event(
#     event_id: int,

#     payload: SecurityEventReview,

#     db: Session = Depends(get_db),

#     recruiter: models.User = Depends(
#         auth.require_role("recruiter")
#     ),
# ):
#     """
#     Recruiter marks an event as:

#         reviewed

#     or:

#         flagged
#     """

#     event = (
#         db.query(models.SecurityEvent)
#         .filter(
#             models.SecurityEvent.id
#             == event_id
#         )
#         .first()
#     )

#     if not event:

#         raise HTTPException(
#             404,
#             "Event not found",
#         )

#     submission = (
#         db.query(
#             models.AssessmentSubmission
#         )
#         .filter(
#             models.AssessmentSubmission.id
#             == event.submission_id
#         )
#         .first()
#     )

#     if not submission:

#         raise HTTPException(
#             404,
#             "Submission not found",
#         )

#     application = (
#         db.query(models.Application)
#         .filter(
#             models.Application.id
#             == submission.application_id
#         )
#         .first()
#     )

#     if not application:

#         raise HTTPException(
#             404,
#             "Application not found",
#         )

#     job = (
#         db.query(models.Job)
#         .filter(
#             models.Job.id
#             == application.job_id,

#             models.Job.recruiter_id
#             == recruiter.id,
#         )
#         .first()
#     )

#     if not job:

#         raise HTTPException(
#             403,
#             "Not your job posting",
#         )

#     if payload.review_status not in (
#         "reviewed",
#         "flagged",
#     ):

#         raise HTTPException(
#             400,
#             "review_status must be 'reviewed' or 'flagged'",
#         )

#     event.review_status = (
#         payload.review_status
#     )

#     event.recruiter_notes = (
#         payload.recruiter_notes
#         or ""
#     )

#     db.commit()

#     return {
#         "saved": True
#     }






























"""
HireMind AI - Recruiter Proctoring Monitor

Provides:

1. Candidate camera snapshots
2. Security-event timeline
3. Backend-authoritative risk scoring
4. Violation -> nearest camera snapshot matching
5. Recruiter review / flagging

Important:
Risk is ALWAYS calculated by risk_engine.py.

The frontend must NEVER calculate risk points.
"""

import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, auth
from ..database import get_db
from ..ai import risk_engine


router = APIRouter(
    prefix="/api/assessments",
    tags=["proctoring"],
)


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
    )
)


UPLOAD_ROOT = os.path.join(
    BASE_DIR,
    "uploads",
    "proctoring",
)


os.makedirs(
    UPLOAD_ROOT,
    exist_ok=True,
)


MAX_SNAPSHOT_BYTES = 3 * 1024 * 1024

SNAPSHOT_MATCH_SECONDS = 10

# Only these event types are camera/vision-based violations where a
# nearby snapshot is actually evidence OF that violation. Everything
# else (WINDOW_BLUR, FULLSCREEN_EXIT, TAB_SWITCH, SUSPICIOUS_AUDIO,
# keyboard/copy/paste/reload events, etc.) can still have a snapshot
# land nearby in time purely by coincidence -- the periodic 45s capture
# doesn't know or care what violation is happening -- but that
# coincidental snapshot isn't evidence of THAT violation, so it should
# never be attached to it. Only these types get matched to a frame.
VISUAL_EVENT_TYPES = {
    "PHONE_DETECTED",
    "MULTIPLE_FACES",
    "NO_FACE",
    "SUSPICIOUS_OBJECT",
}


# ============================================================
# REVIEW MODEL
# ============================================================

class SecurityEventReview(BaseModel):
    review_status: str
    recruiter_notes: Optional[str] = ""


# ============================================================
# HELPERS
# ============================================================

def _iso(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _snapshot_to_dict(snapshot):
    filename = os.path.basename(
        snapshot.file_path
    )

    url = (
        f"/assessments/"
        f"proctor-snapshot/"
        f"{snapshot.submission_id}/"
        f"{filename}"
    )

    return {
        "id": snapshot.id,
        "submission_id": snapshot.submission_id,
        "question_id": (
            snapshot.question_id
            or ""
        ),
        "filename": filename,
        "url": url,
        "captured_at": _iso(
            snapshot.captured_at
        ),
    }


def _event_to_dict(event):
    scoring = risk_engine.score_event(
        event.event_type
    )

    return {
        "id": event.id,
        "event_type": event.event_type,
        "question_id": (
            event.question_id
            or ""
        ),
        "metadata": (
            event.metadata_json
            or {}
        ),
        "created_at": _iso(
            event.created_at
        ),
        "severity": scoring["severity"],
        "risk_points": scoring["points"],
        "label": scoring["label"],
        "review_status": (
            event.review_status
            or "unreviewed"
        ),
        "recruiter_notes": (
            event.recruiter_notes
            or ""
        ),
    }


def _find_nearest_snapshot(
    event,
    snapshots,
):
    """
    Find camera snapshot closest to security event -- but ONLY called
    for event types in VISUAL_EVENT_TYPES (see callers below). A
    non-visual event (audio, fullscreen, tab-switch, etc.) never
    reaches this function at all, so it can never end up with a
    coincidentally-nearby snapshot attached as if it were evidence.
    """

    if not event.created_at:
        return None

    closest = None
    closest_seconds = None

    for snapshot in snapshots:

        if not snapshot.captured_at:
            continue

        difference = abs(
            (
                snapshot.captured_at
                - event.created_at
            ).total_seconds()
        )

        if (
            closest_seconds is None
            or difference < closest_seconds
        ):
            closest = snapshot
            closest_seconds = difference

    if (
        closest is None
        or closest_seconds > SNAPSHOT_MATCH_SECONDS
    ):
        return None

    return closest


def _attach_snapshot(event, event_data, snapshots):
    """
    Shared by both endpoints below: only look up (and attach) a
    snapshot for event types that are actually camera-based
    violations. Everything else gets snapshot=None, full stop --
    no timing coincidence can attach a frame to it.
    """

    if event.event_type not in VISUAL_EVENT_TYPES:
        event_data["snapshot"] = None
        event_data["snapshot_time_difference"] = None
        return event_data

    matched_snapshot = _find_nearest_snapshot(event, snapshots)

    if matched_snapshot:
        event_data["snapshot"] = _snapshot_to_dict(matched_snapshot)

        if matched_snapshot.captured_at and event.created_at:
            event_data["snapshot_time_difference"] = round(
                abs(
                    (
                        matched_snapshot.captured_at
                        - event.created_at
                    ).total_seconds()
                ),
                2,
            )
        else:
            event_data["snapshot_time_difference"] = None
    else:
        event_data["snapshot"] = None
        event_data["snapshot_time_difference"] = None

    return event_data


# ============================================================
# OWNERSHIP
# ============================================================

def _get_owned_submission(
    db: Session,
    application_id: int,
    recruiter: models.User,
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
            models.Job.id
            == application.job_id,
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

    submission = (
        db.query(
            models.AssessmentSubmission
        )
        .filter(
            models.AssessmentSubmission.application_id
            == application_id
        )
        .order_by(
            models.AssessmentSubmission.id.desc()
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            404,
            "No assessment submission for this application",
        )

    return submission


# ============================================================
# CANDIDATE SNAPSHOT UPLOAD
# ============================================================

@router.post(
    "/{assessment_id}/proctor-snapshot"
)
async def upload_proctor_snapshot(
    assessment_id: int,
    file: UploadFile = File(...),
    question_id: str = Form(""),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(
        auth.require_role("candidate")
    ),
):
    submission = (
        db.query(
            models.AssessmentSubmission
        )
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

    if submission.status != "in_progress":
        return {
            "saved": False,
            "reason": "submission not in progress",
        }

    contents = await file.read()

    if len(contents) > MAX_SNAPSHOT_BYTES:
        raise HTTPException(
            413,
            "Snapshot too large",
        )

    if not contents:
        raise HTTPException(
            400,
            "Empty snapshot",
        )

    submission_dir = os.path.join(
        UPLOAD_ROOT,
        str(submission.id),
    )

    os.makedirs(
        submission_dir,
        exist_ok=True,
    )

    filename = (
        f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}_"
        f"{uuid.uuid4().hex[:8]}.jpg"
    )

    absolute_path = os.path.join(
        submission_dir,
        filename,
    )

    with open(
        absolute_path,
        "wb",
    ) as f:
        f.write(contents)

    relative_path = (
        f"proctoring/"
        f"{submission.id}/"
        f"{filename}"
    )

    snapshot = models.ProctorSnapshot(
        submission_id=submission.id,
        candidate_id=candidate.id,
        question_id=question_id or "",
        file_path=relative_path,
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return {
        "saved": True,
        "snapshot": _snapshot_to_dict(
            snapshot
        ),
    }


# ============================================================
# SNAPSHOT IMAGE SERVING
# ============================================================

@router.get(
    "/proctor-snapshot/{submission_id}/{filename}"
)
def get_proctor_snapshot(
    submission_id: int,
    filename: str,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    submission = (
        db.query(
            models.AssessmentSubmission
        )
        .filter(
            models.AssessmentSubmission.id
            == submission_id
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            404,
            "Submission not found",
        )

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id
            == submission.application_id
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
            models.Job.id
            == application.job_id,
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

    safe_filename = os.path.basename(
        filename
    )

    if not safe_filename:
        raise HTTPException(
            400,
            "Invalid filename",
        )

    snapshots = (
        db.query(
            models.ProctorSnapshot
        )
        .filter(
            models.ProctorSnapshot.submission_id
            == submission_id
        )
        .all()
    )

    snapshot = None

    for item in snapshots:
        stored_filename = os.path.basename(
            item.file_path
        )
        if stored_filename == safe_filename:
            snapshot = item
            break

    if not snapshot:
        raise HTTPException(
            404,
            "Snapshot not found",
        )

    absolute_path = os.path.join(
        UPLOAD_ROOT,
        str(submission_id),
        safe_filename,
    )

    if not os.path.isfile(
        absolute_path
    ):
        raise HTTPException(
            404,
            "Snapshot file not found on disk",
        )

    return FileResponse(
        absolute_path,
        media_type="image/jpeg",
        filename=safe_filename,
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        },
    )


# ============================================================
# MAIN RECRUITER PROCTORING ENDPOINT
# ============================================================

@router.get(
    "/submissions/{application_id}/proctoring"
)
def get_proctoring_monitor(
    application_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    """
    SINGLE endpoint used by ProctoringMonitor.jsx.
    """

    submission = _get_owned_submission(
        db,
        application_id,
        recruiter,
    )

    events = (
        db.query(
            models.SecurityEvent
        )
        .filter(
            models.SecurityEvent.submission_id
            == submission.id
        )
        .order_by(
            models.SecurityEvent.created_at.asc()
        )
        .all()
    )

    snapshots = (
        db.query(
            models.ProctorSnapshot
        )
        .filter(
            models.ProctorSnapshot.submission_id
            == submission.id
        )
        .order_by(
            models.ProctorSnapshot.captured_at.asc()
        )
        .all()
    )

    scored_events = []

    for event in events:
        scoring = risk_engine.score_event(
            event.event_type
        )
        scored_events.append(
            {
                "risk_points": scoring["points"],
                "event_type": event.event_type,
            }
        )

    risk = risk_engine.aggregate_risk(
        scored_events
    )

    out_events = []

    for event in events:
        event_data = _event_to_dict(event)
        event_data = _attach_snapshot(event, event_data, snapshots)
        out_events.append(event_data)

    candidate_name = None

    if submission.candidate:
        candidate_name = (
            submission.candidate.full_name
        )

    return {
        "application_id": application_id,
        "candidate_name": candidate_name,
        "submission_id": submission.id,
        "attempt_status": submission.status,
        "submission_type": (
            submission.submission_type
            or ""
        ),
        "score": submission.score,
        "max_score": submission.max_score,
        "violation_count": (
            submission.violation_count
            or 0
        ),
        "terminated_reason": (
            submission.terminated_reason
            or ""
        ),
        "risk_score": risk["score"],
        "risk_band": risk["band"],
        "events": out_events,
        "snapshots": [
            _snapshot_to_dict(snapshot)
            for snapshot in snapshots
        ],
    }


# ============================================================
# SNAPSHOT LIST
# ============================================================

@router.get(
    "/submissions/{application_id}/proctor-snapshots"
)
def list_proctor_snapshots(
    application_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    submission = _get_owned_submission(
        db,
        application_id,
        recruiter,
    )

    snapshots = (
        db.query(
            models.ProctorSnapshot
        )
        .filter(
            models.ProctorSnapshot.submission_id
            == submission.id
        )
        .order_by(
            models.ProctorSnapshot.captured_at.asc()
        )
        .all()
    )

    return [
        _snapshot_to_dict(snapshot)
        for snapshot in snapshots
    ]


# ============================================================
# SECURITY EVENT LIST
# ============================================================

@router.get(
    "/submissions/{application_id}/security-events"
)
def list_security_events(
    application_id: int,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    submission = _get_owned_submission(
        db,
        application_id,
        recruiter,
    )

    events = (
        db.query(
            models.SecurityEvent
        )
        .filter(
            models.SecurityEvent.submission_id
            == submission.id
        )
        .order_by(
            models.SecurityEvent.created_at.asc()
        )
        .all()
    )

    snapshots = (
        db.query(
            models.ProctorSnapshot
        )
        .filter(
            models.ProctorSnapshot.submission_id
            == submission.id
        )
        .order_by(
            models.ProctorSnapshot.captured_at.asc()
        )
        .all()
    )

    scored_events = []
    out_events = []

    for event in events:
        scoring = risk_engine.score_event(
            event.event_type
        )
        scored_events.append(
            {
                "risk_points": scoring["points"],
                "event_type": event.event_type,
            }
        )
        event_data = _event_to_dict(event)
        event_data = _attach_snapshot(event, event_data, snapshots)
        out_events.append(event_data)

    risk = risk_engine.aggregate_risk(
        scored_events
    )

    return {
        "submission_status": submission.status,
        "violation_count": (
            submission.violation_count
            or 0
        ),
        "risk_score": risk["score"],
        "risk_band": risk["band"],
        "events": out_events,
    }


# ============================================================
# RECRUITER REVIEW
# ============================================================

@router.patch(
    "/security-events/{event_id}/review"
)
def review_security_event(
    event_id: int,
    payload: SecurityEventReview,
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(
        auth.require_role("recruiter")
    ),
):
    event = (
        db.query(models.SecurityEvent)
        .filter(
            models.SecurityEvent.id
            == event_id
        )
        .first()
    )

    if not event:
        raise HTTPException(
            404,
            "Event not found",
        )

    submission = (
        db.query(
            models.AssessmentSubmission
        )
        .filter(
            models.AssessmentSubmission.id
            == event.submission_id
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            404,
            "Submission not found",
        )

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id
            == submission.application_id
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
            models.Job.id
            == application.job_id,
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

    if payload.review_status not in (
        "reviewed",
        "flagged",
    ):
        raise HTTPException(
            400,
            "review_status must be 'reviewed' or 'flagged'",
        )

    event.review_status = (
        payload.review_status
    )

    event.recruiter_notes = (
        payload.recruiter_notes
        or ""
    )

    db.commit()

    return {
        "saved": True
    }
