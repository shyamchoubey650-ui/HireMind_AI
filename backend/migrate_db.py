"""
One-time migration for the proctoring/session feature.

What this does:
  1. Adds new columns to `assessment_submissions` (session_id,
     session_expires_at, started_at, current_question, violation_count,
     submission_type, terminated_reason) if they don't already exist.
  2. Creates the new `security_events` table if it doesn't exist.

Safe to run multiple times -- it checks what already exists before
touching anything, and only ever ADDs, never drops or renames.

Run from the `backend` directory:
    python migrate_db.py

If you'd rather skip this (e.g. this is throwaway dev data anyway),
the alternative is just deleting hiremind.db and letting the app
recreate a fresh empty one on next startup -- but that erases all
existing users/jobs/applications, so only do that if you're fine
starting over.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "hiremind.db")

NEW_SUBMISSION_COLUMNS = [
    ("session_id", "TEXT"),
    ("session_expires_at", "DATETIME"),
    ("started_at", "DATETIME"),
    ("current_question", "INTEGER DEFAULT 0"),
    ("violation_count", "INTEGER DEFAULT 0"),
    ("submission_type", "TEXT DEFAULT ''"),
    ("terminated_reason", "TEXT DEFAULT ''"),
]

CREATE_SECURITY_EVENTS = """
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    candidate_id INTEGER,
    event_type TEXT NOT NULL,
    question_id TEXT DEFAULT '',
    metadata_json TEXT,
    created_at DATETIME,
    FOREIGN KEY(submission_id) REFERENCES assessment_submissions(id),
    FOREIGN KEY(candidate_id) REFERENCES users(id)
);
"""


def main():
    if not os.path.exists(DB_PATH):
        print(f"No database found at {DB_PATH} -- nothing to migrate. "
              f"A fresh DB with the new schema will be created automatically on next app startup.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(assessment_submissions)")
    existing_columns = {row[1] for row in cur.fetchall()}

    added = []
    for col_name, col_type in NEW_SUBMISSION_COLUMNS:
        if col_name not in existing_columns:
            cur.execute(f"ALTER TABLE assessment_submissions ADD COLUMN {col_name} {col_type}")
            added.append(col_name)

    cur.execute(CREATE_SECURITY_EVENTS)

    conn.commit()
    conn.close()

    if added:
        print(f"Added columns to assessment_submissions: {', '.join(added)}")
    else:
        print("assessment_submissions already had all new columns -- nothing to add there.")
    print("security_events table ready.")
    print("\nMigration complete.")


if __name__ == "__main__":
    main()
