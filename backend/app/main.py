

# import os

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles

# from dotenv import load_dotenv
# load_dotenv()

# from .database import engine, Base

# from .routers import (
#     auth_router,
#     jobs_router,
#     candidates_router,
#     applications_router,
#     admin_router,
#     assessments_router,
#     interviews_router,
#     notifications_router,
#     companies_router,
#     monitor_router,
#     question_bank_router,
# )


# # ============================================================
# # DATABASE
# # ============================================================

# Base.metadata.create_all(
#     bind=engine
# )


# # ============================================================
# # FASTAPI APPLICATION
# # ============================================================

# app = FastAPI(
#     title="HireMind AI",
#     description=(
#         "Intelligent Recruitment Platform — "
#         "AI resume parsing, semantic matching, "
#         "explainable scoring, and interview question generation."
#     ),
#     version="0.1.0",
# )


# # ============================================================
# # CORS
# # ============================================================

# # Allow local React/Vite development servers regardless
# # of which localhost port they are using.
# #
# # Examples:
# #   http://localhost:3000
# #   http://localhost:5173
# #   http://localhost:5174
# #   http://localhost:5175
# #   http://127.0.0.1:3000
# #   http://127.0.0.1:5173
# #
# # This is important because the frontend sends the
# # authentication token in the Authorization header.

# # app.add_middleware(
# #     CORSMiddleware,

# #     allow_origin_regex=(
# #         r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"
# #     ),

# #     allow_credentials=True,

# #     allow_methods=["*"],

# #     allow_headers=["*"],
# # )


# # ============================================================
# # CORS
# # ============================================================

# frontend_url = os.getenv(
#     "FRONTEND_URL",
#     "https://hiremind-ai-frontend-by42.onrender.com",
# )

# origins = [
#     origin.strip()
#     for origin in frontend_url.split(",")
#     if origin.strip()
# ]

# # Keep local development working as well.
# origins.extend([
#     "http://localhost:3000",
#     "http://localhost:5173",
#     "http://localhost:5174",
#     "http://localhost:5175",
#     "http://127.0.0.1:3000",
#     "http://127.0.0.1:5173",
#     "http://127.0.0.1:5174",
#     "http://127.0.0.1:5175",
# ])

# # Remove duplicates while preserving order.
# origins = list(dict.fromkeys(origins))

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ============================================================
# # UPLOAD DIRECTORY
# # ============================================================

# BACKEND_DIR = os.path.abspath(
#     os.path.join(
#         os.path.dirname(__file__),
#         "..",
#     )
# )

# UPLOADS_DIR = os.path.join(
#     BACKEND_DIR,
#     "uploads",
# )

# os.makedirs(
#     UPLOADS_DIR,
#     exist_ok=True,
# )


# # ============================================================
# # STATIC UPLOADS
# # ============================================================

# app.mount(
#     "/uploads",
#     StaticFiles(
#         directory=UPLOADS_DIR
#     ),
#     name="uploads",
# )


# # ============================================================
# # ROUTERS
# # ============================================================

# app.include_router(
#     auth_router.router
# )

# app.include_router(
#     jobs_router.router
# )

# app.include_router(
#     candidates_router.router
# )

# app.include_router(
#     applications_router.router
# )

# app.include_router(
#     admin_router.router
# )

# app.include_router(
#     assessments_router.router
# )

# app.include_router(
#     interviews_router.router
# )

# app.include_router(
#     notifications_router.router
# )

# app.include_router(
#     companies_router.router
# )

# # ============================================================
# # PROCTORING
# # ============================================================

# # Proctoring snapshot routes are owned by monitor_router.
# app.include_router(
#     monitor_router.router
# )


# # ============================================================
# # QUESTION BANK / ASSESSMENT SETS
# # ============================================================

# # Persistent question bank and assessment-set generation.
# app.include_router(
#     question_bank_router.router
# )


# # ============================================================
# # HEALTH CHECK
# # ============================================================

# @app.get("/api/health")
# def health():
#     return {
#         "status": "ok",
#         "service": "HireMind AI backend",
#     }





# import os

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from dotenv import load_dotenv

# load_dotenv()

# from .database import engine, Base

# from .routers import (
#     auth_router,
#     jobs_router,
#     candidates_router,
#     applications_router,
#     admin_router,
#     assessments_router,
#     interviews_router,
#     notifications_router,
#     companies_router,
#     monitor_router,
#     question_bank_router,
# )


# # ============================================================
# # DATABASE
# # ============================================================

# Base.metadata.create_all(bind=engine)


# # ============================================================
# # FASTAPI APPLICATION
# # ============================================================

# app = FastAPI(
#     title="HireMind AI",
#     description=(
#         "Intelligent Recruitment Platform — "
#         "AI resume parsing, semantic matching, "
#         "explainable scoring, and interview question generation."
#     ),
#     version="0.1.0",
# )


# # ============================================================
# # CORS
# # ============================================================

# # Deployed frontend URL can also be supplied through the
# # FRONTEND_URL environment variable on Render.

# frontend_url = os.getenv(
#     "FRONTEND_URL",
#     "https://hiremind-ai-frontend-by42.onrender.com",
# )

# origins = [
#     origin.strip()
#     for origin in frontend_url.split(",")
#     if origin.strip()
# ]

# # Local development support.
# origins.extend(
#     [
#         "http://localhost:3000",
#         "http://localhost:5173",
#         "http://localhost:5174",
#         "http://localhost:5175",
#         "http://127.0.0.1:3000",
#         "http://127.0.0.1:5173",
#         "http://127.0.0.1:5174",
#         "http://127.0.0.1:5175",
#     ]
# )

# # Remove duplicate origins.
# origins = list(dict.fromkeys(origins))

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ============================================================
# # UPLOAD DIRECTORY
# # ============================================================

# BACKEND_DIR = os.path.abspath(
#     os.path.join(
#         os.path.dirname(__file__),
#         "..",
#     )
# )

# UPLOADS_DIR = os.path.join(
#     BACKEND_DIR,
#     "uploads",
# )

# os.makedirs(
#     UPLOADS_DIR,
#     exist_ok=True,
# )


# # ============================================================
# # STATIC UPLOADS
# # ============================================================

# app.mount(
#     "/uploads",
#     StaticFiles(
#         directory=UPLOADS_DIR
#     ),
#     name="uploads",
# )


# # ============================================================
# # ROUTERS
# # ============================================================

# app.include_router(
#     auth_router.router
# )

# app.include_router(
#     jobs_router.router
# )

# app.include_router(
#     candidates_router.router
# )

# app.include_router(
#     applications_router.router
# )

# app.include_router(
#     admin_router.router
# )

# app.include_router(
#     assessments_router.router
# )

# app.include_router(
#     interviews_router.router
# )

# app.include_router(
#     notifications_router.router
# )

# app.include_router(
#     companies_router.router
# )


# # ============================================================
# # PROCTORING
# # ============================================================

# # Proctoring snapshot routes are owned by monitor_router.

# app.include_router(
#     monitor_router.router
# )


# # ============================================================
# # QUESTION BANK / ASSESSMENT SETS
# # ============================================================

# # Persistent question bank and assessment-set generation.

# app.include_router(
#     question_bank_router.router
# )


# # ============================================================
# # HEALTH CHECK
# # ============================================================

# @app.get("/api/health")
# def health():
#     return {
#         "status": "ok",
#         "service": "HireMind AI",
#     }






import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from .database import engine, Base, SessionLocal
from . import models, auth

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

Base.metadata.create_all(bind=engine)


# ============================================================
# ONE-TIME ADMIN BOOTSTRAP
# ============================================================

def bootstrap_admin():
    """
    Creates or promotes one admin account using environment
    variables.

    Required environment variables:
        ADMIN_EMAIL
        ADMIN_PASSWORD
        ADMIN_NAME (optional)

    This is intentionally NOT exposed as an API endpoint.
    """

    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    admin_name = os.getenv(
        "ADMIN_NAME",
        "HireMind Administrator",
    ).strip()

    # Do nothing unless both values are configured.
    if not admin_email or not admin_password:
        return

    if len(admin_password) < 6:
        print(
            "[ADMIN BOOTSTRAP] ADMIN_PASSWORD must contain "
            "at least 6 characters."
        )
        return

    db = SessionLocal()

    try:
        user = (
            db.query(models.User)
            .filter(models.User.email == admin_email)
            .first()
        )

        if user:
            changed = False

            # Promote existing account to admin.
            if user.role != "admin":
                user.role = "admin"
                changed = True

            if not user.is_active:
                user.is_active = True
                changed = True

            # Keep the configured admin name if supplied.
            if admin_name and user.full_name != admin_name:
                user.full_name = admin_name
                changed = True

            # Set the configured password.
            user.hashed_password = auth.hash_password(
                admin_password
            )
            changed = True

            if changed:
                db.commit()

            print(
                f"[ADMIN BOOTSTRAP] Admin account ready: "
                f"{admin_email}"
            )

        else:
            admin = models.User(
                email=admin_email,
                hashed_password=auth.hash_password(
                    admin_password
                ),
                full_name=admin_name or "HireMind Administrator",
                role="admin",
                is_active=True,
            )

            db.add(admin)
            db.commit()

            print(
                f"[ADMIN BOOTSTRAP] Admin account created: "
                f"{admin_email}"
            )

    except Exception as exc:
        db.rollback()

        print(
            "[ADMIN BOOTSTRAP] Failed to create/update admin:",
            exc,
        )

    finally:
        db.close()


# Run after the database tables exist.
bootstrap_admin()


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

# Deployed frontend URL can also be supplied through the
# FRONTEND_URL environment variable on Render.

frontend_url = os.getenv(
    "FRONTEND_URL",
    "https://hiremind-ai-frontend-by42.onrender.com",
)

origins = [
    origin.strip()
    for origin in frontend_url.split(",")
    if origin.strip()
]

# Local development support.
origins.extend(
    [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5500",          # ← add this
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5500",          # ← add this
    ]
)

# Remove duplicate origins.
origins = list(dict.fromkeys(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

app.include_router(
    monitor_router.router
)


# ============================================================
# QUESTION BANK / ASSESSMENT SETS
# ============================================================

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
        "service": "HireMind AI",
    }