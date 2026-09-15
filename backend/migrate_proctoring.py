"""
Migration for the proctoring monitor feature: extends security_events
with severity/risk scoring/review fields, and creates proctor_snapshots.

Idempotent -- checks what already exists before touching anything.
Run from the backend directory:  python migrate_proctoring.py
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "hiremind.db")

NEW_SECURITY_EVENT_COLUMNS = [
    ("severity", "TEXT DEFAULT 'low'"),        # low | medium | high
    ("risk_points", "INTEGER DEFAULT 0"),
    ("review_status", "TEXT DEFAULT 'unreviewed'"),  # unreviewed | reviewed | flagged
    ("recruiter_notes", "TEXT DEFAULT ''"),
]

CREATE_PROCTOR_SNAPSHOTS = """
CREATE TABLE IF NOT EXISTS proctor_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    candidate_id INTEGER,
    question_id TEXT DEFAULT '',
    file_path TEXT NOT NULL,
    captured_at DATETIME,
    FOREIGN KEY(submission_id) REFERENCES assessment_submissions(id),
    FOREIGN KEY(candidate_id) REFERENCES users(id)
);
"""


def main():
    if not os.path.exists(DB_PATH):
        print(f"No database found at {DB_PATH} -- nothing to migrate.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='security_events'")
    if not cur.fetchone():
        print("WARNING: security_events table doesn't exist yet -- run the earlier "
              "migrate_db.py first (it creates this table). Skipping.")
        conn.close()
        return

    cur.execute("PRAGMA table_info(security_events)")
    existing_columns = {row[1] for row in cur.fetchall()}

    added = []
    for col_name, col_type in NEW_SECURITY_EVENT_COLUMNS:
        if col_name not in existing_columns:
            cur.execute(f"ALTER TABLE security_events ADD COLUMN {col_name} {col_type}")
            added.append(col_name)

    cur.execute(CREATE_PROCTOR_SNAPSHOTS)

    conn.commit()
    conn.close()

    if added:
        print(f"Added columns to security_events: {', '.join(added)}")
    else:
        print("security_events already had all new columns.")
    print("proctor_snapshots table ready.")
    print("\nMigration complete. Restart the backend.")


if __name__ == "__main__":
    main()
