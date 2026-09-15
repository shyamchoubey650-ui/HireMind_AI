# HireMind AI — Intelligent Recruitment Platform (Prototype)

A working full-stack prototype: candidates upload resumes, recruiters post jobs,
and an AI engine parses resumes/JDs, computes an **explainable semantic match score**,
ranks candidates, and generates **interview questions** — all offline, no API keys needed.

> **Honest note on stack choice:** the original architecture spec called for a
> React + Spring Boot + PostgreSQL stack. This prototype uses **FastAPI (Python) +
> plain HTML/JS + SQLite** instead, so you can run the whole thing in under 2 minutes
> with one command and no build tooling, while keeping the exact same AI logic,
> REST API shape, and DB schema. The `docker-compose.yml` shows the Postgres upgrade
> path, and the README below explains how to port the backend to Spring Boot if you
> want to match the original slide deck 1:1. Be upfront about this in interviews —
> it's a completely reasonable and common thing to do at prototype stage.

---

## 1. What's actually implemented (all real, no mocked responses)

| Feature from your list | Status | Where |
|---|---|---|
| Recruiter dashboard | ✅ | `frontend/recruiter.html` |
| Candidate dashboard | ✅ | `frontend/candidate.html` |
| Admin dashboard | ✅ | `frontend/admin.html` |
| JWT authentication + roles (admin/recruiter/candidate) | ✅ | `backend/app/auth.py` |
| Job creation | ✅ | `POST /api/jobs` |
| Resume upload (pdf/docx/txt) | ✅ | `POST /api/candidates/me/resume/upload` |
| AI resume parsing (skills, experience, education, contact) | ✅ | `backend/app/ai/resume_parser.py` |
| AI job-description analysis | ✅ | same module, `parse_job_description()` |
| Semantic candidate-job matching | ✅ | `backend/app/ai/matcher.py` (TF-IDF cosine similarity) |
| Explainable match score | ✅ | returned as a `breakdown` object per application |
| Candidate ranking | ✅ | `GET /api/jobs/{id}/applicants` (sorted by score) |
| AI interview-question generation | ✅ | `backend/app/ai/interview_ai.py` |
| Skill-gap analysis | ✅ | `interview_ai.skill_gap_analysis()` |
| **Full ATS pipeline** (AI Screening → Shortlisted → Assessment → Interview → Selected/Rejected) | ✅ | `backend/app/routers/applications_router.py` |
| **AI-generated assessments** (MCQ + short-answer, auto-scored) | ✅ | `backend/app/ai/assessment_ai.py`, `assessments_router.py` |
| **Interview scheduling** (type, date/time, meeting link, notes, feedback) | ✅ | `backend/app/routers/interviews_router.py` |
| **In-app notifications** (fired on apply/status-change/assessment/interview) | ✅ | `backend/app/notify.py`, `notifications_router.py` |
| **Admin role** (user management, deactivate accounts, platform-wide analytics) | ✅ | `backend/app/routers/admin_router.py` |
| Analytics dashboard (recruiter + admin) | ✅ | `GET /api/applications/analytics/overview`, `GET /api/admin/analytics/overview` |
| Docker + deployment | ✅ | `docker-compose.yml` (Postgres + backend + static frontend) |
| Email notifications | ⚠️ not implemented | in-app only; see "Known simplifications" |

Everything marked ✅ is real, working code — not a stub.

---

## 2. Folder structure

```
hiremind-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, router registration
│   │   ├── database.py             # SQLAlchemy engine/session (SQLite by default)
│   │   ├── models.py               # User, CandidateProfile, Job, Application,
│   │   │                           #   Assessment, AssessmentSubmission, Interview, Notification
│   │   ├── schemas.py              # Pydantic request/response models
│   │   ├── auth.py                 # JWT + password hashing + role guards
│   │   ├── notify.py               # in-app notification helper (used by other routers)
│   │   ├── ai/
│   │   │   ├── resume_parser.py    # skills taxonomy + regex extraction
│   │   │   ├── matcher.py          # TF-IDF semantic similarity + explainable score
│   │   │   ├── interview_ai.py     # interview question generation, skill-gap analysis
│   │   │   └── assessment_ai.py    # AI-generated MCQ/short-answer questions + auto-scoring
│   │   └── routers/
│   │       ├── auth_router.py         # /api/auth/*
│   │       ├── jobs_router.py         # /api/jobs/*
│   │       ├── candidates_router.py   # /api/candidates/*
│   │       ├── applications_router.py # /api/applications/* — ATS pipeline
│   │       ├── assessments_router.py  # /api/assessments/*
│   │       ├── interviews_router.py   # /api/interviews/*
│   │       ├── notifications_router.py# /api/notifications/*
│   │       └── admin_router.py        # /api/admin/*
│   ├── uploads/                    # (created at runtime, gitignore this)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── create_admin.py             # one-time script to seed an admin account
│   └── run.py                      # `python run.py` to start dev server
├── frontend/
│   ├── index.html                  # login/register
│   ├── candidate.html              # candidate dashboard
│   ├── recruiter.html              # recruiter dashboard
│   ├── admin.html                  # admin dashboard
│   ├── css/style.css
│   └── js/
│       ├── api.js                  # fetch wrapper + auth/session + notification bell + score UI helpers
│       ├── candidate.js
│       ├── recruiter.js
│       └── admin.js
├── docker-compose.yml               # Postgres + backend + static frontend server
└── README.md
```

---

## 3. Run it — Option A: no Docker (fastest, SQLite)

Requires Python 3.10+.

```bash
# 1. Backend
cd hiremind-ai/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
# → backend now running at http://localhost:8000
# → interactive API docs at http://localhost:8000/docs
```

In a **second terminal**, serve the static frontend (any static server works):

```bash
cd hiremind-ai/frontend
python -m http.server 5500
# → open http://localhost:5500 in your browser
```

That's it — SQLite file `hiremind.db` is created automatically in `backend/`.

**To create an admin account** (admins are seeded, not self-registered — same as real ATS platforms), run this once from the `backend/` folder with the venv active:

```bash
python create_admin.py
```

It'll prompt for email/name/password, then you can log in through the normal login page and you'll be routed to the admin dashboard automatically.

---

## 4. Run it — Option B: Docker (Postgres, closer to "production")

```bash
cd hiremind-ai
docker compose up --build
```

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5500
- Postgres: localhost:5432 (user/pass/db = `hiremind`)

---

## 5. The ATS pipeline

Every application moves through six stages, matching the "process depth" version of the architecture:

```
ai_screening → shortlisted → assessment → interview → selected | rejected
```

- **ai_screening** — set automatically the instant a candidate applies (the AI has already computed their match score, so there's no separate manual "applied" queue).
- **shortlisted** — recruiter manually promotes a candidate after reviewing the AI match breakdown.
- **assessment** — set automatically when a recruiter assigns an AI-generated assessment to that candidate.
- **interview** — set automatically when a recruiter schedules an interview for that candidate.
- **selected / rejected** — terminal states, set manually by the recruiter.

Recruiters can also drag a candidate directly between any two stages on the kanban board — assigning an assessment or scheduling an interview are just the two "guided" ways of doing the same status update, with side effects (assessment gets created / interview gets scheduled) attached.

Every stage transition fires an in-app notification to the candidate (`backend/app/notify.py`), visible via the bell icon in the top-right of every dashboard.

## 6. Assessments module

- Recruiter clicks **Assign assessment** on any candidate → if the job has no assessment yet, one is auto-generated from the job's `required_skills` (`ai/assessment_ai.py`'s `QUESTION_BANK`, mixed MCQ + short-answer).
- Candidate answers it in **Assessments** tab → MCQs are graded exactly against the correct option; short-answer questions are graded by keyword-overlap against an expected-concepts list, with per-question feedback (`assessment_ai.score_submission()`).
- Score appears instantly to both the candidate and, via `GET /api/assessments/submissions/{application_id}`, the recruiter.

This is deliberately not an LLM call — it's explainable, offline, and fast, matching the same "explainable AI" design principle used for match scoring and interview questions. The doc's "AI Interview Assistant" (a live text-based Q&A evaluator) was intentionally left out of this pass since you prioritized process depth over additional AI surface area — it's a natural next addition if you want it, using the same scoring pattern.

## 7. UI notes

The frontend was rebuilt around one idea: a recruitment pipeline is a dispatch
board — candidates move through platforms (stages), scores flip in like
split-flap arrivals-board digits. Concretely:

- Sidebar navigation per role instead of top tabs
- Match scores render as animated SVG progress rings + odometer-style
  digit reveals (`renderOdometer` / `scoreRingHTML` in `js/api.js`)
- Recruiter pipeline is a **real drag-and-drop kanban board** — drag a
  candidate card between "platforms" (Applied → Shortlisted → Interview →
  Hired/Rejected) and it PATCHes the status live, with optimistic UI + rollback on failure
  (`onDragStart` / `onDrop` in `js/recruiter.js`)
  and a stats/status bar chart via Chart.js on the analytics page
- Candidate resume upload has a real drag-and-drop dropzone
  (`setupDropzone` in `js/candidate.js`)
  and a full-detail modal for each applicant
  (`js/recruiter.js`)
- Toast notifications replace `alert()`, skeleton loaders replace blank "Loading..." text
- Design tokens (colors/fonts) are centralized in `css/style.css` — change
  `--amber` / `--teal` / `--rust` there to re-theme everything at once

## 8. Demo script (what to click through for your placement demo)

1. **Register as a recruiter** → go to "Post a Job" → paste a real JD (include
   skills like "Python, Spring Boot, PostgreSQL, Docker, 3+ years experience")
   → submit. Watch the AI auto-extract required skills as tags.
2. **Open an incognito window, register as a candidate** → "My Resume" → paste
   a sample resume (or upload a real PDF) → AI extracts skills/experience/education.
3. Candidate → "Browse Jobs" → Apply. This triggers the **matching AI**:
   TF-IDF text similarity + skill overlap + experience fit → weighted, explainable score.
4. Candidate → "My Applications" → expand "Why this score?" → see the full
   breakdown (each component's score, weight, and explanation) plus **AI-generated
   interview questions** tailored to their matched/missing skills.
5. Switch back to recruiter → "Jobs & Pipeline" → click a job → see candidates
   **ranked by AI match score** on a drag-and-drop kanban board (AI Screening →
   Shortlisted → Assessment → Interview → Selected/Rejected).
6. Click a candidate card → **"Assign assessment"** → since no assessment exists
   for this job yet, click "Generate AI assessment & assign" → watch it
   auto-generate MCQ + short-answer questions from the job's required skills.
7. Switch back to the candidate tab → **"Assessments"** → take the assessment →
   submit → see the score and per-question feedback instantly (no page reload,
   no external grading service).
8. Recruiter → open the same candidate again → **"Schedule interview"** → pick
   a type/date/time → candidate sees it appear under their **"Interviews"** tab.
9. Click the 🔔 bell icon on either dashboard → **in-app notifications** fire
   automatically at every pipeline transition (apply, status change, assessment
   assigned/scored, interview scheduled).
10. Log in as the seeded **admin** account (see step 3 above) → "Users" tab →
    deactivate a test account and confirm it can no longer log in → "Platform
    Overview" → aggregate stats across every recruiter/candidate/job on the system.

---

## 9. How the AI actually works (for your interview explanation)

- **Resume/JD parsing**: a curated taxonomy of ~80 tech skills with aliases
  (e.g. "node", "nodejs", "node.js" → `node.js`), matched against normalized
  text with word-boundary regex. Plus regex extraction for email, phone,
  years of experience ("5+ years of experience"), and degree.
- **Semantic matching**: `TfidfVectorizer` + `cosine_similarity` from
  scikit-learn — a classic vector-space-model approach to semantic text
  similarity between resume and JD, combined with a Jaccard-style skill-overlap
  score and an experience-fit ratio. Final score = `0.40*text_sim + 0.45*skill_overlap + 0.15*experience_fit`.
  This is deliberately explainable (no black box) — you can defend every number.
- **Interview question generation**: template bank keyed by skill, biased
  toward (a) verifying depth on skills the candidate claims, (b) probing
  gaps on required-but-missing skills, (c) one seniority-appropriate system
  design question, (d) one behavioral question.
- **Upgrade path** (mention this in interviews to show you know the limits):
  swap TF-IDF for **sentence-transformer embeddings** (e.g. `all-MiniLM-L6-v2`)
  and cosine similarity in embedding space for true meaning-based matching
  instead of word-overlap; swap the template question bank for an LLM call
  (Claude/GPT) with the same function signature.

---

## 10. Porting the backend to Spring Boot (to match your original diagram)

The REST API surface, DB schema, and AI logic are stack-agnostic:

- `models.py` → 4 JPA `@Entity` classes (User, CandidateProfile, Job, Application) — same fields.
- `routers/*.py` → 4 Spring `@RestController` classes with identical endpoints.
- `auth.py` → Spring Security + `jjwt` library for JWT.
- `ai/*.py` → the algorithms (TF-IDF, regex skill extraction, template question
  generation) can be reimplemented in Java directly, or kept as a small Python
  microservice that Spring Boot calls over HTTP (a common real-world pattern —
  "polyglot microservices", which is actually a good talking point).
- `database.py` → `application.properties` pointing at the same Postgres schema.

---

## 11. Known simplifications (be upfront about these)

- Password hashing uses PBKDF2-HMAC (stdlib) instead of bcrypt — fine for a
  prototype, swap to `passlib[bcrypt]` for production.
- No email/SMS notifications — the `status` field changes are visible in-app
  only. Would add via a background task + SMTP/SendGrid.
- No interview calendar scheduling — status pipeline only (`interview` state).
- Matching is TF-IDF-based, not deep embeddings — see upgrade path above.
- CORS is wide open (`*`) for demo convenience — restrict in production.
