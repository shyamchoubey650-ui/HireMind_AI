

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv
load_dotenv()

from .database import engine, Base

from .routers import (
    auth_router,
    jobs_router,
    candidates_router,
    applications_router,
    admin_router,
    assessments_router,
    interviews_router,
    notifications_router,
    companies_router,
    monitor_router,
    question_bank_router,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="HireMind AI",
    description=(
        "Intelligent Recruitment Platform — "
        "AI resume parsing, semantic matching, "
        "explainable scoring, and interview question generation."
    ),
    version="0.1.0",
)


# ============================================================
# CORS
# ============================================================

# Allow local React/Vite development servers regardless
# of which localhost port they are using.
#
# Examples:
#   http://localhost:3000
#   http://localhost:5173
#   http://localhost:5174
#   http://localhost:5175
#   http://127.0.0.1:3000
#   http://127.0.0.1:5173
#
# This is important because the frontend sends the
# authentication token in the Authorization header.

app.add_middleware(
    CORSMiddleware,

    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    ),

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

BACKEND_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
    )
)

UPLOADS_DIR = os.path.join(
    BACKEND_DIR,
    "uploads",
)

os.makedirs(
    UPLOADS_DIR,
    exist_ok=True,
)


# ============================================================
# STATIC UPLOADS
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOADS_DIR
    ),
    name="uploads",
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    auth_router.router
)

app.include_router(
    jobs_router.router
)

app.include_router(
    candidates_router.router
)

app.include_router(
    applications_router.router
)

app.include_router(
    admin_router.router
)

app.include_router(
    assessments_router.router
)

app.include_router(
    interviews_router.router
)

app.include_router(
    notifications_router.router
)

app.include_router(
    companies_router.router
)

# ============================================================
# PROCTORING
# ============================================================

# Proctoring snapshot routes are owned by monitor_router.
app.include_router(
    monitor_router.router
)


# ============================================================
# QUESTION BANK / ASSESSMENT SETS
# ============================================================

# Persistent question bank and assessment-set generation.
app.include_router(
    question_bank_router.router
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "HireMind AI backend",
    }