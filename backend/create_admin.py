"""
One-time script to create an admin account.

Admins are NOT self-registered through the public /api/auth/register
endpoint (that only accepts "recruiter" / "candidate") — this mirrors how
real ATS platforms provision internal staff accounts out-of-band.

Usage:
    python create_admin.py
    (then follow the prompts)
"""
import getpass
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app import models, auth

Base.metadata.create_all(bind=engine)


def main():
    db = SessionLocal()
    try:
        print("=== Create HireMind AI admin account ===")
        email = input("Admin email: ").strip()
        full_name = input("Full name: ").strip()
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")

        if password != confirm:
            print("Passwords don't match. Aborting.")
            return
        if len(password) < 6:
            print("Password must be at least 6 characters. Aborting.")
            return

        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            print(f"A user with email {email} already exists (role: {existing.role}).")
            return

        admin = models.User(
            email=email,
            hashed_password=auth.hash_password(password),
            full_name=full_name,
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"\nAdmin account created: {email}")
        print("Log in at the normal login page (index.html) — you'll be routed to the admin dashboard.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
