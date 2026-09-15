


from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime,
    Boolean,
    JSON,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate_profile = relationship(
        "CandidateProfile",
        back_populates="user",
        uselist=False,
    )

    jobs = relationship(
        "Job",
        back_populates="recruiter",
    )


# ============================================================
# CANDIDATE PROFILE
# ============================================================

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
    )

    resume_text = Column(Text, default="")
    resume_filename = Column(String, default="")
    skills = Column(JSON, default=list)
    years_experience = Column(Float, default=0.0)
    education = Column(String, default="")
    phone = Column(String, default="")

    # --------------------------------------------------------
    # Academic achievements
    # --------------------------------------------------------

    tenth_marks = Column(Float, nullable=True)
    tenth_certificate_filename = Column(String, default="")

    twelfth_marks = Column(Float, nullable=True)
    twelfth_certificate_filename = Column(String, default="")

    degree_name = Column(String, default="")
    degree_certificate_filename = Column(String, default="")

    certificates = Column(JSON, default=list)

    user = relationship(
        "User",
        back_populates="candidate_profile",
    )


# ============================================================
# JOB
# ============================================================

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    recruiter_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    min_experience = Column(Float, default=0.0)
    location = Column(String, default="Remote")
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship(
        "User",
        back_populates="jobs",
    )

    applications = relationship(
        "Application",
        back_populates="job",
    )

    # --------------------------------------------------------
    # Derived fields
    # --------------------------------------------------------

    @property
    def recruiter_name(self):
        return self.recruiter.full_name if self.recruiter else None

    @property
    def recruiter_email(self):
        return self.recruiter.email if self.recruiter else None

    @property
    def applications_count(self):
        return len(self.applications) if self.applications is not None else 0

    @property
    def avg_match_score(self):
        apps = self.applications or []

        if not apps:
            return 0.0

        return round(
            sum((a.match_score or 0.0) for a in apps) / len(apps),
            1,
        )


# ============================================================
# APPLICATION
# ============================================================

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
    )

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    status = Column(
        String,
        default="ai_screening",
    )

    match_score = Column(
        Float,
        default=0.0,
    )

    match_breakdown = Column(
        JSON,
        default=dict,
    )

    matched_skills = Column(
        JSON,
        default=list,
    )

    missing_skills = Column(
        JSON,
        default=list,
    )

    interview_questions = Column(
        JSON,
        default=list,
    )

    applied_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    job = relationship(
        "Job",
        back_populates="applications",
    )

    candidate = relationship(
        "User",
    )

    # --------------------------------------------------------
    # Derived fields
    # --------------------------------------------------------

    @property
    def candidate_name(self):
        return self.candidate.full_name if self.candidate else None

    @property
    def candidate_email(self):
        return self.candidate.email if self.candidate else None

    @property
    def job_title(self):
        return self.job.title if self.job else None

    @property
    def job_location(self):
        return self.job.location if self.job else None


# ============================================================
# ASSESSMENT
# ============================================================

class Assessment(Base):
    """
    A set of AI-generated or recruiter-authored
    questions tied to a job.
    """

    __tablename__ = "assessments"

    DEFAULT_DURATION_MINUTES = 180

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
    )

    title = Column(
        String,
        nullable=False,
    )

    questions = Column(
        JSON,
        default=list,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    job = relationship(
        "Job",
    )

    @property
    def total_questions(self):
        return len(self.questions or [])

    @property
    def total_marks(self):
        return round(
            sum(
                (
                    q.get("marks", 1.0)
                    for q in (self.questions or [])
                ),
                0.0,
            ),
            2,
        )

    @property
    def section_breakdown(self):
        breakdown = {}

        for q in (self.questions or []):

            question_type = q.get(
                "type",
                "mcq",
            )

            section = breakdown.setdefault(
                question_type,
                {
                    "count": 0,
                    "marks": 0.0,
                },
            )

            section["count"] += 1
            section["marks"] += q.get(
                "marks",
                1.0,
            )

        for section in breakdown.values():
            section["marks"] = round(
                section["marks"],
                2,
            )

        return breakdown


# ============================================================
# ASSESSMENT SUBMISSION
# ============================================================

class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
    )

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    status = Column(
        String,
        default="assigned",
    )

    answers = Column(
        JSON,
        default=dict,
    )

    score = Column(
        Float,
        default=None,
        nullable=True,
    )

    max_score = Column(
        Float,
        default=0.0,
    )

    per_question_feedback = Column(
        JSON,
        default=list,
    )

    assigned_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    submitted_at = Column(
        DateTime,
        nullable=True,
    )

    # --------------------------------------------------------
    # Secure assessment / session fields
    # --------------------------------------------------------

    session_id = Column(
        String,
        nullable=True,
    )

    session_expires_at = Column(
        DateTime,
        nullable=True,
    )

    started_at = Column(
        DateTime,
        nullable=True,
    )

    current_question = Column(
        Integer,
        default=0,
    )

    violation_count = Column(
        Integer,
        default=0,
    )

    submission_type = Column(
        String,
        default="",
    )

    terminated_reason = Column(
        String,
        default="",
    )

    assessment = relationship(
        "Assessment",
    )

    application = relationship(
        "Application",
    )

    candidate = relationship(
        "User",
    )

    @property
    def section_breakdown(self):
        breakdown = {}

        for feedback in (
            self.per_question_feedback or []
        ):

            question_type = feedback.get(
                "type",
                "mcq",
            )

            section = breakdown.setdefault(
                question_type,
                {
                    "points": 0.0,
                    "max_points": 0.0,
                },
            )

            section["points"] += feedback.get(
                "points",
                0.0,
            )

            section["max_points"] += feedback.get(
                "max_points",
                0.0,
            )

        for section in breakdown.values():

            section["points"] = round(
                section["points"],
                2,
            )

            section["max_points"] = round(
                section["max_points"],
                2,
            )

        return breakdown


# ============================================================
# SECURITY EVENT
# ============================================================

class SecurityEvent(Base):
    """
    Security/proctoring event generated during an assessment.

    Examples:

        TAB_SWITCH
        FULLSCREEN_EXIT
        CAMERA_DISCONNECTED
        NO_FACE
        MULTIPLE_FACES
        PHONE_DETECTED
        SUSPICIOUS_AUDIO
        WINDOW_BLUR
        PAGE_RELOAD
        COPY_ATTEMPT
        PASTE_ATTEMPT
    """

    __tablename__ = "security_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    submission_id = Column(
        Integer,
        ForeignKey("assessment_submissions.id"),
    )

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    event_type = Column(
        String,
        nullable=False,
    )

    question_id = Column(
        String,
        default="",
    )

    metadata_json = Column(
        JSON,
        default=dict,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    # ========================================================
    # Proctoring / risk fields
    # ========================================================

    severity = Column(
        String,
        default="low",
    )

    risk_points = Column(
        Integer,
        default=0,
    )

    # ========================================================
    # Recruiter review fields
    # ========================================================

    review_status = Column(
        String,
        default="unreviewed",
    )

    recruiter_notes = Column(
        String,
        default="",
    )

    submission = relationship(
        "AssessmentSubmission",
    )

    candidate = relationship(
        "User",
    )


# ============================================================
# PROCTOR SNAPSHOT
# ============================================================

class ProctorSnapshot(Base):
    """
    Camera snapshot captured during an assessment.
    """

    __tablename__ = "proctor_snapshots"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    submission_id = Column(
        Integer,
        ForeignKey("assessment_submissions.id"),
    )

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    question_id = Column(
        String,
        default="",
    )

    file_path = Column(
        String,
        nullable=False,
    )

    captured_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    submission = relationship(
        "AssessmentSubmission",
    )

    candidate = relationship(
        "User",
    )


# ============================================================
# INTERVIEW
# ============================================================

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
    )

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    recruiter_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    interview_type = Column(
        String,
        default="technical",
    )

    scheduled_at = Column(
        DateTime,
        nullable=False,
    )

    meeting_link = Column(
        String,
        default="",
    )

    notes = Column(
        Text,
        default="",
    )

    status = Column(
        String,
        default="scheduled",
    )

    feedback = Column(
        Text,
        default="",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    application = relationship(
        "Application",
    )

    job = relationship(
        "Job",
    )

    candidate = relationship(
        "User",
        foreign_keys=[candidate_id],
    )

    recruiter = relationship(
        "User",
        foreign_keys=[recruiter_id],
    )

    @property
    def candidate_name(self):
        return self.candidate.full_name if self.candidate else None

    @property
    def candidate_email(self):
        return self.candidate.email if self.candidate else None

    @property
    def job_title(self):
        return self.job.title if self.job else None


# ============================================================
# NOTIFICATION
# ============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    type = Column(
        String,
        default="info",
    )

    message = Column(
        String,
        nullable=False,
    )

    link_type = Column(
        String,
        default="",
    )

    link_id = Column(
        Integer,
        nullable=True,
    )

    is_read = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
    )