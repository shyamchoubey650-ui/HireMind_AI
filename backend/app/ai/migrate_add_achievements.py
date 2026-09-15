"""
One-time migration: adds the achievement columns to candidate_profiles on
an already-existing hiremind.db. Base.metadata.create_all() (called at
startup in main.py) only creates tables that don't exist yet -- it never
alters an existing table's columns, so a fresh column added to the
CandidateProfile model in models.py needs an explicit ALTER TABLE here.

Lives at backend/app/ai/migrate_add_achievements.py. Run once from the
backend/ directory (same place you run run.py from):
    python app/ai/migrate_add_achievements.py

Safe to re-run: each ALTER TABLE is wrapped so an already-added column
is skipped instead of erroring.
"""
import sqlite3
import os


def find_db():
    """Searches upward from this script's own location (and from the
    current working directory, in case it's run from somewhere other
    than backend/) for hiremind.db, instead of trusting one fixed
    relative path -- so it still works no matter which folder the
    script physically ends up sitting in."""
    tried = []
    here = os.path.dirname(os.path.abspath(__file__))
    d = here
    for _ in range(6):
        candidate = os.path.normpath(os.path.join(d, "hiremind.db"))
        tried.append(candidate)
        if os.path.exists(candidate):
            return candidate, tried
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    cwd_candidate = os.path.normpath(os.path.join(os.getcwd(), "hiremind.db"))
    if cwd_candidate not in tried:
        tried.append(cwd_candidate)
        if os.path.exists(cwd_candidate):
            return cwd_candidate, tried
    return None, tried


DB_PATH, TRIED_PATHS = find_db()

COLUMNS = [
    ("tenth_marks", "REAL"),
    ("tenth_certificate_filename", "TEXT DEFAULT ''"),
    ("twelfth_marks", "REAL"),
    ("twelfth_certificate_filename", "TEXT DEFAULT ''"),
    ("degree_name", "TEXT DEFAULT ''"),
    ("degree_certificate_filename", "TEXT DEFAULT ''"),
    ("certificates", "TEXT DEFAULT '[]'"),
]


def main():
    if not DB_PATH:
        print("Could not find hiremind.db. Checked these locations:")
        for p in TRIED_PATHS:
            print(f"  - {p}")
        print("\nFind the real file with: dir /s /b hiremind.db   (run from the backend folder)")
        print("Then tell me the path it prints and I'll adjust the script.")
        return

    print(f"Using database: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    existing = {row[1] for row in cur.execute("PRAGMA table_info(candidate_profiles)")}

    added = []
    for col_name, col_type in COLUMNS:
        if col_name in existing:
            continue
        cur.execute(f"ALTER TABLE candidate_profiles ADD COLUMN {col_name} {col_type}")
        added.append(col_name)

    conn.commit()
    conn.close()

    if added:
        print(f"Added columns: {', '.join(added)}")
    else:
        print("candidate_profiles already has all achievement columns -- nothing to do.")


if __name__ == "__main__":
    main()
