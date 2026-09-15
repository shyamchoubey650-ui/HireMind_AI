
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---------- Auth ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Jobs ----------

class JobCreate(BaseModel):
    title: str
    description: str
    min_experience: float = 0.0
    location: str = "Remote"


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    min_experience: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None


class JobOut(BaseModel):
    id: int
    title: str
    description: str
    required_skills: List[str]
    min_experience: float
    location: str
    status: str
    created_at: datetime
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    applications_count: Optional[int] = 0
    avg_match_score: Optional[float] = 0.0

    class Config:
        from_attributes = True


# ---------- Companies ----------

# There is no Company table in HireMind -- "company" is derived from
# the recruiter (User) who posted a job, via Job.recruiter_id.
class CompanyOut(BaseModel):
    id: int
    name: str
    open_jobs_count: int
    total_jobs_count: int
    member_since: datetime

    class Config:
        from_attributes = True


class CompanyListOut(BaseModel):
    items: List[CompanyOut]
    total: int
    page: int
    page_size: int


# ---------- Candidate ----------

class CertificateOut(BaseModel):
    name: str
    filename: str
    uploaded_at: str


class CandidateProfileOut(BaseModel):
    id: int
    resume_filename: str
    skills: List[str]
    years_experience: float
    education: str
    phone: str

    tenth_marks: Optional[float] = None
    tenth_certificate_filename: str = ""

    twelfth_marks: Optional[float] = None
    twelfth_certificate_filename: str = ""

    degree_name: str = ""
    degree_certificate_filename: str = ""

    certificates: List[CertificateOut] = []

    class Config:
        from_attributes = True


class ResumeTextIn(BaseModel):
    resume_text: str


# ---------- Applications ----------

class ApplicationCreate(BaseModel):
    job_id: int


class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None
    job_location: Optional[str] = None
    status: str
    match_score: float
    match_breakdown: Dict
    matched_skills: List[str]
    missing_skills: List[str]
    interview_questions: List[str]
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str


# ---------- Assessments ----------

class AssessmentQuestionIn(BaseModel):
    type: str
    question: str
    marks: float = 1.0
    difficulty: Optional[str] = "medium"
    order: Optional[int] = None
    skill_tag: Optional[str] = ""

    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None

    expected_answer: Optional[str] = None
    accepted_answers: Optional[List[str]] = None

    problem_statement: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    examples: Optional[List[Dict[str, str]]] = None
    starter_code: Optional[Dict[str, str]] = None
    allowed_languages: Optional[List[str]] = None
    visible_test_cases: Optional[List[Dict[str, str]]] = None
    hidden_test_cases: Optional[List[Dict[str, str]]] = None
    time_limit_ms: Optional[int] = 2000
    memory_limit_mb: Optional[int] = 128

    keywords: Optional[List[str]] = None


class QuestionMix(BaseModel):
    mcq: int = 25
    fill_blank: int = 5
    coding: int = 5


class AssessmentCreate(BaseModel):
    job_id: int
    title: str
    auto_generate: bool = True
    num_questions: int = 30
    question_mix: Optional[QuestionMix] = None
    questions: Optional[List[AssessmentQuestionIn]] = None


class AssessmentOut(BaseModel):
    id: int
    job_id: int
    title: str
    questions: List[Dict[str, Any]]
    total_questions: int
    total_marks: float
    section_breakdown: Dict[str, Dict[str, float]]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentQuestionPublic(BaseModel):
    id: str
    type: str
    question: str
    marks: float = 1.0
    difficulty: Optional[str] = "medium"
    skill_tag: Optional[str] = ""

    options: Optional[List[str]] = None

    problem_statement: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    examples: Optional[List[Dict[str, str]]] = None
    starter_code: Optional[Dict[str, str]] = None
    allowed_languages: Optional[List[str]] = None
    visible_test_cases: Optional[List[Dict[str, str]]] = None
    time_limit_ms: Optional[int] = None
    memory_limit_mb: Optional[int] = None
    hidden_test_count: Optional[int] = None


# ============================================================
# NORMAL ASSESSMENT ASSIGNMENT
# ============================================================

class AssessmentAssign(BaseModel):
    application_id: int


# ============================================================
# EXACT ASSESSMENT SET ASSIGNMENT
# ============================================================

class AssessmentSetAssign(BaseModel):
    """
    Assign one specific recruiter-generated AssessmentSet
    to one candidate/application.

    application_id:
        The candidate's application ID.

    set_id:
        The exact AssessmentSet ID selected by the recruiter.
    """

    application_id: int
    set_id: int


class AssessmentSubmissionOut(BaseModel):
    id: int
    assessment_id: int
    application_id: int
    candidate_id: int
    status: str
    answers: Dict[str, Any]
    score: Optional[float] = None
    max_score: float
    per_question_feedback: List[Dict[str, Any]]
    section_breakdown: Dict[str, Dict[str, float]] = {}

    assigned_at: datetime
    submitted_at: Optional[datetime] = None

    session_id: Optional[str] = None
    session_expires_at: Optional[datetime] = None
    started_at: Optional[datetime] = None

    current_question: Optional[int] = 0
    violation_count: Optional[int] = 0

    submission_type: Optional[str] = ""
    terminated_reason: Optional[str] = ""

    job_title: Optional[str] = None
    assessment_title: Optional[str] = None

    class Config:
        from_attributes = True


class AssessmentAnswerIn(BaseModel):
    answers: Dict[str, Any]
    submission_type: Optional[str] = "MANUAL"
    terminated_reason: Optional[str] = ""


class AutosaveIn(BaseModel):
    answers: Dict[str, Any]
    current_question: Optional[int] = 0


class SessionStartOut(BaseModel):
    session_id: str
    expires_at: datetime
    current_question: int
    answers: Dict[str, Any]
    duration_minutes: int
    total_questions: int
    total_marks: float


class HeartbeatOut(BaseModel):
    valid: bool
    expires_at: Optional[datetime] = None
    seconds_remaining: Optional[int] = None


class SecurityEventIn(BaseModel):
    eventType: str
    questionId: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SecurityEventOut(BaseModel):
    auto_submitted: bool
    violation_count: int
    final_score: Optional[float] = None
    message: str


class CodeTestCase(BaseModel):
    input: Optional[str] = None
    expectedOutput: Optional[str] = None
    output: Optional[str] = None


class CodeRunIn(BaseModel):
    questionId: str
    language: str
    code: str
    testCases: List[CodeTestCase] = []


class CodeRunOut(BaseModel):
    passed: int
    total: int
    runtime: str
    results: List[Dict[str, Any]]
    compile_error: Optional[str] = None


# ---------- Interviews ----------

class InterviewCreate(BaseModel):
    application_id: int
    interview_type: str = "technical"
    scheduled_at: datetime
    meeting_link: str = ""
    notes: str = ""


class InterviewOut(BaseModel):
    id: int
    application_id: int
    job_id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None
    recruiter_id: int
    interview_type: str
    scheduled_at: datetime
    meeting_link: str
    notes: str
    status: str
    feedback: str
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewUpdate(BaseModel):
    status: Optional[str] = None
    feedback: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


# ---------- Notifications ----------

class NotificationOut(BaseModel):
    id: int
    type: str
    message: str
    link_type: str
    link_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Admin ----------

class AdminAnalyticsOut(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_jobs: int
    open_jobs: int
    total_applications: int
    avg_match_score: float
    status_breakdown: Dict[str, int]
    total_interviews: int
    total_assessments_assigned: int