

# import os
# import uuid
# from datetime import datetime
# from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
# from sqlalchemy.orm import Session
# from .. import models, schemas, auth
# from ..database import get_db
# from ..ai import resume_parser

# router = APIRouter(prefix="/api/candidates", tags=["candidates"])

# UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Achievement documents (marksheets, degree, certificates) are actual
# # scanned/photographed documents a recruiter may open later, so -- unlike
# # the resume upload below, which only keeps extracted text -- these are
# # saved to disk as-is and served back via the /uploads static mount added
# # in main.py. Restrict to what a marksheet/certificate realistically is.
# ALLOWED_ACHIEVEMENT_EXTS = {"pdf", "jpg", "jpeg", "png"}
# MAX_CERTIFICATES = 3


# def _extract_text_from_file(filename: str, raw: bytes) -> str:
#     ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
#     if ext == "pdf":
#         try:
#             import io
#             from PyPDF2 import PdfReader
#             reader = PdfReader(io.BytesIO(raw))
#             return "\n".join((page.extract_text() or "") for page in reader.pages)
#         except Exception:
#             return ""
#     if ext == "docx":
#         try:
#             import io
#             import docx
#             document = docx.Document(io.BytesIO(raw))
#             return "\n".join(p.text for p in document.paragraphs)
#         except Exception:
#             return ""
#     # txt or unknown -> best-effort decode
#     try:
#         return raw.decode("utf-8", errors="ignore")
#     except Exception:
#         return ""


# def _get_or_create_profile(db: Session, candidate: models.User) -> models.CandidateProfile:
#     profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
#     if not profile:
#         profile = models.CandidateProfile(user_id=candidate.id)
#         db.add(profile)
#         db.flush()
#     return profile


# def _validate_achievement_ext(filename: str):
#     ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
#     if ext not in ALLOWED_ACHIEVEMENT_EXTS:
#         raise HTTPException(400, "Only PDF, JPG, or PNG files are accepted.")
#     return ext


# def _save_achievement_file(candidate_id: int, tag: str, filename: str, raw: bytes) -> str:
#     """Writes the raw bytes to UPLOAD_DIR under a unique name (so two
#     candidates uploading files with the same original name never collide)
#     and returns that saved filename for storing on the profile."""
#     ext = _validate_achievement_ext(filename)
#     saved_name = f"{candidate_id}_{tag}_{uuid.uuid4().hex[:8]}.{ext}"
#     with open(os.path.join(UPLOAD_DIR, saved_name), "wb") as f:
#         f.write(raw)
#     return saved_name


# def _delete_achievement_file(filename: str):
#     if not filename:
#         return
#     try:
#         os.remove(os.path.join(UPLOAD_DIR, filename))
#     except OSError:
#         pass  # already gone -- fine, this is best-effort cleanup


# @router.get("/me/profile", response_model=schemas.CandidateProfileOut)
# def get_profile(
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
#     if not profile:
#         raise HTTPException(404, "Profile not found")
#     return profile


# @router.post("/me/resume/upload", response_model=schemas.CandidateProfileOut)
# async def upload_resume(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     raw = await file.read()
#     text = _extract_text_from_file(file.filename, raw)
#     if not text.strip():
#         raise HTTPException(400, "Could not extract text from file. Try pasting resume text instead.")
#     return _save_parsed_resume(db, candidate, text, file.filename)


# @router.post("/me/resume/text", response_model=schemas.CandidateProfileOut)
# def submit_resume_text(
#     payload: schemas.ResumeTextIn,
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     return _save_parsed_resume(db, candidate, payload.resume_text, "pasted_text.txt")


# def _save_parsed_resume(db: Session, candidate: models.User, text: str, filename: str):
#     parsed = resume_parser.parse_resume(text)
#     profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
#     if not profile:
#         profile = models.CandidateProfile(user_id=candidate.id)
#         db.add(profile)
#     profile.resume_text = text
#     profile.resume_filename = filename
#     profile.skills = parsed["skills"]
#     profile.years_experience = parsed["years_experience"]
#     profile.education = parsed["education"]
#     profile.phone = parsed["phone"]
#     db.commit()
#     db.refresh(profile)
#     return profile


# # ---------- Achievements: 10th / 12th / degree / certificates ----------

# @router.post("/me/achievements/tenth", response_model=schemas.CandidateProfileOut)
# async def upload_tenth(
#     marks: float = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     raw = await file.read()
#     profile = _get_or_create_profile(db, candidate)
#     # replace the old file on disk if one was already uploaded, so we don't
#     # silently accumulate orphaned files every time someone re-uploads
#     _delete_achievement_file(profile.tenth_certificate_filename)
#     saved_name = _save_achievement_file(candidate.id, "tenth", file.filename, raw)
#     profile.tenth_marks = marks
#     profile.tenth_certificate_filename = saved_name
#     db.commit()
#     db.refresh(profile)
#     return profile


# @router.post("/me/achievements/twelfth", response_model=schemas.CandidateProfileOut)
# async def upload_twelfth(
#     marks: float = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     raw = await file.read()
#     profile = _get_or_create_profile(db, candidate)
#     _delete_achievement_file(profile.twelfth_certificate_filename)
#     saved_name = _save_achievement_file(candidate.id, "twelfth", file.filename, raw)
#     profile.twelfth_marks = marks
#     profile.twelfth_certificate_filename = saved_name
#     db.commit()
#     db.refresh(profile)
#     return profile


# @router.post("/me/achievements/degree", response_model=schemas.CandidateProfileOut)
# async def upload_degree(
#     degree_name: str = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     raw = await file.read()
#     profile = _get_or_create_profile(db, candidate)
#     _delete_achievement_file(profile.degree_certificate_filename)
#     saved_name = _save_achievement_file(candidate.id, "degree", file.filename, raw)
#     profile.degree_name = degree_name
#     profile.degree_certificate_filename = saved_name
#     db.commit()
#     db.refresh(profile)
#     return profile


# @router.post("/me/achievements/certificates", response_model=schemas.CandidateProfileOut)
# async def add_certificate(
#     name: str = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     profile = _get_or_create_profile(db, candidate)
#     existing = list(profile.certificates or [])
#     if len(existing) >= MAX_CERTIFICATES:
#         raise HTTPException(400, f"You can upload up to {MAX_CERTIFICATES} certificates.")
#     raw = await file.read()
#     saved_name = _save_achievement_file(candidate.id, "cert", file.filename, raw)
#     existing.append({"name": name, "filename": saved_name, "uploaded_at": datetime.utcnow().isoformat()})
#     profile.certificates = existing
#     db.commit()
#     db.refresh(profile)
#     return profile


# @router.delete("/me/achievements/certificates/{index}", response_model=schemas.CandidateProfileOut)
# def delete_certificate(
#     index: int,
#     db: Session = Depends(get_db),
#     candidate: models.User = Depends(auth.require_role("candidate")),
# ):
#     profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
#     if not profile:
#         raise HTTPException(404, "Profile not found")
#     existing = list(profile.certificates or [])
#     if index < 0 or index >= len(existing):
#         raise HTTPException(404, "Certificate not found")
#     removed = existing.pop(index)
#     _delete_achievement_file(removed.get("filename", ""))
#     profile.certificates = existing
#     db.commit()
#     db.refresh(profile)
#     return profile












import os
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from ..ai import resume_parser

router = APIRouter(prefix="/api/candidates", tags=["candidates"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Achievement documents (marksheets, degree, certificates) are actual
# scanned/photographed documents a recruiter may open later, so -- unlike
# the resume upload below, which only keeps extracted text -- these are
# saved to disk as-is and served back via the /uploads static mount added
# in main.py. Restrict to what a marksheet/certificate realistically is.
ALLOWED_ACHIEVEMENT_EXTS = {"pdf", "jpg", "jpeg", "png"}
MAX_CERTIFICATES = 3


class CandidateProfileUpdate(BaseModel):
    years_experience: Optional[float] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None


def _extract_text_from_file(filename: str, raw: bytes) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        try:
            import io
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(raw))
            return "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception:
            return ""
    if ext == "docx":
        try:
            import io
            import docx
            document = docx.Document(io.BytesIO(raw))
            return "\n".join(p.text for p in document.paragraphs)
        except Exception:
            return ""
    # txt or unknown -> best-effort decode
    try:
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def _get_or_create_profile(db: Session, candidate: models.User) -> models.CandidateProfile:
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
    if not profile:
        profile = models.CandidateProfile(user_id=candidate.id)
        db.add(profile)
        db.flush()
    return profile


def _validate_achievement_ext(filename: str):
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ALLOWED_ACHIEVEMENT_EXTS:
        raise HTTPException(400, "Only PDF, JPG, or PNG files are accepted.")
    return ext


def _save_achievement_file(candidate_id: int, tag: str, filename: str, raw: bytes) -> str:
    """Writes the raw bytes to UPLOAD_DIR under a unique name (so two
    candidates uploading files with the same original name never collide)
    and returns that saved filename for storing on the profile."""
    ext = _validate_achievement_ext(filename)
    saved_name = f"{candidate_id}_{tag}_{uuid.uuid4().hex[:8]}.{ext}"
    with open(os.path.join(UPLOAD_DIR, saved_name), "wb") as f:
        f.write(raw)
    return saved_name


def _delete_achievement_file(filename: str):
    if not filename:
        return
    try:
        os.remove(os.path.join(UPLOAD_DIR, filename))
    except OSError:
        pass  # already gone -- fine, this is best-effort cleanup


@router.get("/me/profile", response_model=schemas.CandidateProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile


@router.patch("/me/profile", response_model=schemas.CandidateProfileOut)
def update_profile(
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    """
    Updates the candidate's custom skills, edited years of experience,
    and degree in the database so they persist permanently across reloads.
    """
    profile = _get_or_create_profile(db, candidate)

    if payload.years_experience is not None:
        profile.years_experience = payload.years_experience
    if payload.education is not None:
        profile.education = payload.education
    if payload.skills is not None:
        profile.skills = payload.skills

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/resume/upload", response_model=schemas.CandidateProfileOut)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    raw = await file.read()
    text = _extract_text_from_file(file.filename, raw)
    if not text.strip():
        raise HTTPException(400, "Could not extract text from file. Try pasting resume text instead.")
    return _save_parsed_resume(db, candidate, text, file.filename)


@router.post("/me/resume/text", response_model=schemas.CandidateProfileOut)
def submit_resume_text(
    payload: schemas.ResumeTextIn,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    return _save_parsed_resume(db, candidate, payload.resume_text, "pasted_text.txt")


def _save_parsed_resume(db: Session, candidate: models.User, text: str, filename: str):
    parsed = resume_parser.parse_resume(text)
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
    if not profile:
        profile = models.CandidateProfile(user_id=candidate.id)
        db.add(profile)
    profile.resume_text = text
    profile.resume_filename = filename
    profile.skills = parsed["skills"]
    profile.years_experience = parsed["years_experience"]
    profile.education = parsed["education"]
    profile.phone = parsed["phone"]
    db.commit()
    db.refresh(profile)
    return profile


# ---------- Achievements: 10th / 12th / degree / certificates ----------

@router.post("/me/achievements/tenth", response_model=schemas.CandidateProfileOut)
async def upload_tenth(
    marks: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    raw = await file.read()
    profile = _get_or_create_profile(db, candidate)
    # replace the old file on disk if one was already uploaded, so we don't
    # silently accumulate orphaned files every time someone re-uploads
    _delete_achievement_file(profile.tenth_certificate_filename)
    saved_name = _save_achievement_file(candidate.id, "tenth", file.filename, raw)
    profile.tenth_marks = marks
    profile.tenth_certificate_filename = saved_name
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/achievements/twelfth", response_model=schemas.CandidateProfileOut)
async def upload_twelfth(
    marks: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    raw = await file.read()
    profile = _get_or_create_profile(db, candidate)
    _delete_achievement_file(profile.twelfth_certificate_filename)
    saved_name = _save_achievement_file(candidate.id, "twelfth", file.filename, raw)
    profile.twelfth_marks = marks
    profile.twelfth_certificate_filename = saved_name
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/achievements/degree", response_model=schemas.CandidateProfileOut)
async def upload_degree(
    degree_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    raw = await file.read()
    profile = _get_or_create_profile(db, candidate)
    _delete_achievement_file(profile.degree_certificate_filename)
    saved_name = _save_achievement_file(candidate.id, "degree", file.filename, raw)
    profile.degree_name = degree_name
    profile.degree_certificate_filename = saved_name
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/achievements/certificates", response_model=schemas.CandidateProfileOut)
async def add_certificate(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    profile = _get_or_create_profile(db, candidate)
    existing = list(profile.certificates or [])
    if len(existing) >= MAX_CERTIFICATES:
        raise HTTPException(400, f"You can upload up to {MAX_CERTIFICATES} certificates.")
    raw = await file.read()
    saved_name = _save_achievement_file(candidate.id, "cert", file.filename, raw)
    existing.append({"name": name, "filename": saved_name, "uploaded_at": datetime.utcnow().isoformat()})
    profile.certificates = existing
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/me/achievements/certificates/{index}", response_model=schemas.CandidateProfileOut)
def delete_certificate(
    index: int,
    db: Session = Depends(get_db),
    candidate: models.User = Depends(auth.require_role("candidate")),
):
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == candidate.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    existing = list(profile.certificates or [])
    if index < 0 or index >= len(existing):
        raise HTTPException(404, "Certificate not found")
    removed = existing.pop(index)
    _delete_achievement_file(removed.get("filename", ""))
    profile.certificates = existing
    db.commit()
    db.refresh(profile)
    return profile