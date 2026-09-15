
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db

# router = APIRouter(prefix="/api/auth", tags=["auth"])


# @router.post("/register", response_model=schemas.Token)
# def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
#     if payload.role not in ("recruiter", "candidate"):
#         raise HTTPException(400, "role must be 'recruiter' or 'candidate'")
#     existing = db.query(models.User).filter(models.User.email == payload.email).first()
#     if existing:
#         raise HTTPException(400, "Email already registered")
#     user = models.User(
#         email=payload.email,
#         hashed_password=auth.hash_password(payload.password),
#         full_name=payload.full_name,
#         role=payload.role,
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     if user.role == "candidate":
#         profile = models.CandidateProfile(user_id=user.id)
#         db.add(profile)
#         db.commit()
#     token = auth.create_access_token({"sub": str(user.id)})
#     return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


# @router.post("/login", response_model=schemas.Token)
# def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.email == payload.email).first()
#     if not user or not auth.verify_password(payload.password, user.hashed_password):
#         raise HTTPException(401, "Invalid email or password")
#     if not user.is_active:
#         raise HTTPException(403, "This account has been deactivated. Contact an administrator.")
#     token = auth.create_access_token({"sub": str(user.id)})
#     return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


# @router.get("/me", response_model=schemas.UserOut)
# def me(current_user: models.User = Depends(auth.get_current_user)):
#     return current_user


# class ResetPasswordRequest(BaseModel):
#     email: str
#     new_password: str


# @router.post("/reset-password")
# def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.email == payload.email).first()
#     if not user:
#         raise HTTPException(404, "No account found with this email")

#     user.hashed_password = auth.hash_password(payload.new_password)
#     db.commit()
#     return {"message": "Password updated successfully"}





import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip()


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if payload.role not in ("recruiter", "candidate"):
        raise HTTPException(400, "Role must be 'recruiter' or 'candidate'")
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "Email already registered")
    user = models.User(
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    if user.role == "candidate":
        profile = models.CandidateProfile(user_id=user.id)
        db.add(profile)
        db.commit()
    token = auth.create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    if not user.is_active:
        raise HTTPException(403, "This account has been deactivated. Contact an administrator.")
    token = auth.create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


class DemoLoginRequest(BaseModel):
    role: str  # "recruiter" | "candidate"


@router.post("/demo-login", response_model=schemas.Token)
def demo_login(payload: DemoLoginRequest, db: Session = Depends(get_db)):
    """Logs in or auto-provisions a seamless 1-click test account."""
    if payload.role not in ("recruiter", "candidate"):
        raise HTTPException(400, "Invalid demo role")

    email = f"demo.{payload.role}@hiremind.ai"
    full_name = "Demo Recruiter" if payload.role == "recruiter" else "Demo Candidate"

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            hashed_password=auth.hash_password("DemoPassword123!"),
            full_name=full_name,
            role=payload.role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if user.role == "candidate":
            profile = models.CandidateProfile(
                user_id=user.id,
                years_experience=3.5,
                education="B.Tech in Computer Science",
                skills=["Python", "FastAPI", "React", "Docker"],
            )
            db.add(profile)
            db.commit()

    token = auth.create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


# ============================================================
# GOOGLE OAUTH
# ============================================================

# ============================================================
# GOOGLE OAUTH
# ============================================================

@router.get("/google/login")
def login_google(frontend: str = Query(None)):
    """
    Start the real Google OAuth flow.

    The browser is redirected to Google's official login/account
    selection page. There is NO mock/fallback login.
    """

    google_client_id = get_env("GOOGLE_CLIENT_ID")
    google_redirect_uri = get_env(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:8000/api/auth/google/callback"
    )

    if not google_client_id:
        frontend_url = get_env(
            "FRONTEND_URL",
            "http://localhost:5173"
        )
        return RedirectResponse(
            f"{frontend_url}/login?error=google_not_configured"
        )

    from urllib.parse import urlencode

    params = {
        "client_id": google_client_id,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": google_redirect_uri,
        "prompt": "select_account",
    }

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urlencode(params)
    )

    return RedirectResponse(google_auth_url)


@router.get("/google/callback")
def google_callback(
    code: str = Query(None),
    error: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    Google redirects here after the user authenticates.

    The authorization code is exchanged for a Google access token,
    then the user's Google profile is retrieved.
    """

    frontend_url = get_env(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    if error:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_auth_denied"
        )

    if not code:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_code_missing"
        )

    google_client_id = get_env("GOOGLE_CLIENT_ID")
    google_client_secret = get_env("GOOGLE_CLIENT_SECRET")
    google_redirect_uri = get_env(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:8000/api/auth/google/callback"
    )

    if not google_client_id or not google_client_secret:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_not_configured"
        )

    # --------------------------------------------------------
    # Exchange authorization code for Google access token
    # --------------------------------------------------------

    token_url = "https://oauth2.googleapis.com/token"

    token_data = {
        "code": code,
        "client_id": google_client_id,
        "client_secret": google_client_secret,
        "redirect_uri": google_redirect_uri,
        "grant_type": "authorization_code",
    }

    try:
        response = requests.post(
            token_url,
            data=token_data,
            timeout=15,
        )
    except requests.RequestException:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_token_exchange_failed"
        )

    if not response.ok:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_token_exchange_failed"
        )

    tokens = response.json()

    access_token = tokens.get("access_token")

    if not access_token:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_token_missing"
        )

    # --------------------------------------------------------
    # Get Google user information
    # --------------------------------------------------------

    try:
        userinfo_resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={
                "Authorization": f"Bearer {access_token}"
            },
            timeout=15,
        )
    except requests.RequestException:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_userinfo_failed"
        )

    if not userinfo_resp.ok:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_userinfo_failed"
        )

    user_data = userinfo_resp.json()

    email = user_data.get("email")

    if not email:
        return RedirectResponse(
            f"{frontend_url}/login?error=google_email_not_provided"
        )

    full_name = user_data.get("name") or email.split("@")[0]

    # --------------------------------------------------------
    # Find existing HireMind account
    # or create a new candidate account
    # --------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if not user:
        user = models.User(
            email=email,
            full_name=full_name,
            hashed_password=auth.hash_password(
                os.urandom(32).hex()
            ),
            role="candidate",
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        profile = models.CandidateProfile(
            user_id=user.id
        )

        db.add(profile)
        db.commit()

    if not user.is_active:
        return RedirectResponse(
            f"{frontend_url}/login?error=account_deactivated"
        )

    # --------------------------------------------------------
    # Create HireMind JWT
    # --------------------------------------------------------

    token = auth.create_access_token(
        {"sub": str(user.id)}
    )

    return RedirectResponse(
        f"{frontend_url}/login?token={token}"
    )


# ============================================================
# GITHUB OAUTH
# ============================================================

@router.get("/github/login")
def login_github(frontend: str = Query(None)):
    """
    Start the real GitHub OAuth flow.

    The browser is redirected to GitHub's official
    authorization page. There is NO mock/fallback login.
    """

    github_client_id = get_env("GITHUB_CLIENT_ID")
    github_redirect_uri = get_env(
        "GITHUB_REDIRECT_URI",
        "http://localhost:8000/api/auth/github/callback"
    )

    if not github_client_id:
        frontend_url = get_env(
            "FRONTEND_URL",
            "http://localhost:5173"
        )
        return RedirectResponse(
            f"{frontend_url}/login?error=github_not_configured"
        )

    from urllib.parse import urlencode

    params = {
        "client_id": github_client_id,
        "redirect_uri": github_redirect_uri,
        "scope": "user:email",
    }

    github_auth_url = (
        "https://github.com/login/oauth/authorize?"
        + urlencode(params)
    )

    return RedirectResponse(github_auth_url)


@router.get("/github/callback")
def github_callback(
    code: str = Query(None),
    error: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    GitHub redirects here after authorization.

    The authorization code is exchanged for a GitHub access token,
    then the GitHub user's profile and email are retrieved.
    """

    frontend_url = get_env(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    if error:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_auth_denied"
        )

    if not code:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_code_missing"
        )

    github_client_id = get_env("GITHUB_CLIENT_ID")
    github_client_secret = get_env("GITHUB_CLIENT_SECRET")
    github_redirect_uri = get_env(
        "GITHUB_REDIRECT_URI",
        "http://localhost:8000/api/auth/github/callback"
    )

    if not github_client_id or not github_client_secret:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_not_configured"
        )

    # --------------------------------------------------------
    # Exchange GitHub authorization code for access token
    # --------------------------------------------------------

    token_url = "https://github.com/login/oauth/access_token"

    token_data = {
        "client_id": github_client_id,
        "client_secret": github_client_secret,
        "code": code,
        "redirect_uri": github_redirect_uri,
    }

    try:
        response = requests.post(
            token_url,
            data=token_data,
            headers={
                "Accept": "application/json"
            },
            timeout=15,
        )
    except requests.RequestException:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_token_exchange_failed"
        )

    if not response.ok:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_token_exchange_failed"
        )

    tokens = response.json()

    access_token = tokens.get("access_token")

    if not access_token:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_token_missing"
        )

    # --------------------------------------------------------
    # Get GitHub user information
    # --------------------------------------------------------

    try:
        user_resp = requests.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
            timeout=15,
        )

        email_resp = requests.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
            timeout=15,
        )

    except requests.RequestException:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_userinfo_failed"
        )

    if not user_resp.ok:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_userinfo_failed"
        )

    user_info = user_resp.json()

    emails = (
        email_resp.json()
        if email_resp.ok
        else []
    )

    # --------------------------------------------------------
    # Find primary GitHub email
    # --------------------------------------------------------

    primary_email = None

    if isinstance(emails, list):
        for item in emails:
            if (
                isinstance(item, dict)
                and item.get("primary")
                and item.get("verified")
            ):
                primary_email = item.get("email")
                break

    # GitHub may not return a public email from /user.
    if not primary_email:
        primary_email = user_info.get("email")

    if not primary_email:
        return RedirectResponse(
            f"{frontend_url}/login?error=github_email_not_provided"
        )

    full_name = (
        user_info.get("name")
        or user_info.get("login")
        or "GitHub User"
    )

    # --------------------------------------------------------
    # Find existing HireMind account
    # or create new candidate account
    # --------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(models.User.email == primary_email)
        .first()
    )

    if not user:
        user = models.User(
            email=primary_email,
            full_name=full_name,
            hashed_password=auth.hash_password(
                os.urandom(32).hex()
            ),
            role="candidate",
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        profile = models.CandidateProfile(
            user_id=user.id
        )

        db.add(profile)
        db.commit()

    if not user.is_active:
        return RedirectResponse(
            f"{frontend_url}/login?error=account_deactivated"
        )

    # --------------------------------------------------------
    # Create HireMind JWT
    # --------------------------------------------------------

    token = auth.create_access_token(
        {"sub": str(user.id)}
    )

    return RedirectResponse(
        f"{frontend_url}/login?token={token}"
    )

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(404, "No account found with this email")

    user.hashed_password = auth.hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}