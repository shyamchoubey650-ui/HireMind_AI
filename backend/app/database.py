"""
Database configuration.

Prototype uses SQLite (zero setup) so you can run this in 60 seconds.
For the "real" version, swap DATABASE_URL for Postgres, e.g.:
    postgresql+psycopg2://hiremind:hiremind@localhost:5432/hiremind
and add `psycopg2-binary` to requirements.txt. No other code changes needed
because SQLAlchemy abstracts the dialect.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hiremind.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
