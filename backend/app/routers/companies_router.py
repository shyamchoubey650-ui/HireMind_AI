from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import cast, String

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/companies", tags=["companies"])


def _to_company_out(recruiter: models.User, db: Session) -> schemas.CompanyOut:
    total = db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).count()
    open_count = db.query(models.Job).filter(
        models.Job.recruiter_id == recruiter.id, models.Job.status == "open"
    ).count()
    return schemas.CompanyOut(
        id=recruiter.id,
        name=recruiter.full_name,
        open_jobs_count=open_count,
        total_jobs_count=total,
        member_since=recruiter.created_at,
    )


@router.get("", response_model=schemas.CompanyListOut)
def list_companies(
    search: Optional[str] = Query(None, description="Matches company (recruiter) name, job title, description, or skills"),
    location: Optional[str] = Query(None, description="Matches the location of at least one of the company's open jobs"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    'Company' is not a modeled entity in HireMind — there is no Company
    table, only recruiter accounts (User.role == "recruiter") who post
    jobs via Job.recruiter_id. This endpoint derives a company-like view
    by grouping OPEN jobs by their posting recruiter, rather than creating
    a duplicate/parallel company model. A recruiter with no open jobs
    never appears here: Choose Company is a job-discovery flow, and a
    company with nothing to apply to has nothing to discover.

    Only fields backed by real columns are returned (see schemas.CompanyOut)
    — no logo, industry, website, size, or benefits, since none of that
    exists anywhere in the current schema.
    """
    base_query = (
        db.query(models.User)
        .join(models.Job, models.Job.recruiter_id == models.User.id)
        .filter(models.User.role == "recruiter", models.Job.status == "open")
    )

    if location:
        base_query = base_query.filter(models.Job.location.ilike(f"%{location}%"))

    if search:
        like = f"%{search}%"
        base_query = base_query.filter(
            models.User.full_name.ilike(like)
            | models.Job.title.ilike(like)
            | models.Job.description.ilike(like)
            | cast(models.Job.required_skills, String).ilike(like)
        )

    base_query = base_query.distinct().order_by(models.User.full_name)

    total = base_query.count()
    page_items = base_query.offset((page - 1) * page_size).limit(page_size).all()

    return schemas.CompanyListOut(
        items=[_to_company_out(r, db) for r in page_items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{company_id}", response_model=schemas.CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    recruiter = db.query(models.User).filter(
        models.User.id == company_id, models.User.role == "recruiter"
    ).first()
    if not recruiter:
        raise HTTPException(404, "Company not found")

    has_any_job = db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).first()
    if not has_any_job:
        # Matches list_companies' rule: no jobs, ever = not a discoverable company.
        raise HTTPException(404, "Company not found")

    return _to_company_out(recruiter, db)
