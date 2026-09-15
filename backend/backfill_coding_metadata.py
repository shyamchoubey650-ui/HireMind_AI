"""
One-time backfill for assessments created BEFORE input_pattern/output_pattern
were added to coding questions in assessment_ai.py.

Symptom this fixes: clicking "Run Code" on a Java/C++ coding question shows
"pattern (None, None) not implemented" even though that exact pattern IS
implemented -- because the stored question JSON predates the metadata and
question.get("input_pattern") / .get("output_pattern") come back None.

What this does: walks every Assessment row, and for each coding-type
question, matches it to the known CODING_BANK entry by title (the
"question" field on a finalized coding question is exactly the bank
entry's "title") and patches in the missing input_pattern/output_pattern
fields. Does NOT touch MCQ/fill_blank questions or anything else.

Safe to re-run -- questions that already have both fields are skipped.

Run from the backend directory:
    python backfill_coding_metadata.py
"""
import json
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "hiremind.db")

# Must match app/ai/assessment_ai.py's CODING_BANK exactly (title -> patterns)
TITLE_TO_PATTERNS = {
    "Sum of a List":       ("count_then_list", "int"),
    "Reverse a String":    ("single_string", "string"),
    "FizzBuzz":            ("single_int", "string_lines"),
    "Check Palindrome":    ("single_string", "bool_lower"),
    "Factorial":           ("single_int", "int"),
    "Check Prime":         ("single_int", "bool_lower"),
    "Two Sum":             ("list_then_target", "int_pair"),
    "Binary Search":       ("list_then_target", "int"),
}


def main():
    if not os.path.exists(DB_PATH):
        print(f"No database found at {DB_PATH} -- nothing to backfill.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id, questions FROM assessments")
    rows = cur.fetchall()

    total_patched_questions = 0
    total_patched_assessments = 0
    unmatched_titles = set()

    for assessment_id, questions_json in rows:
        if not questions_json:
            continue
        try:
            questions = json.loads(questions_json)
        except (TypeError, json.JSONDecodeError):
            continue

        changed = False
        for q in questions:
            if q.get("type") != "coding":
                continue
            if q.get("input_pattern") and q.get("output_pattern"):
                continue  # already has it, nothing to do

            title = q.get("question", "")
            patterns = TITLE_TO_PATTERNS.get(title)
            if patterns:
                q["input_pattern"], q["output_pattern"] = patterns
                changed = True
                total_patched_questions += 1
            else:
                unmatched_titles.add(title)

        if changed:
            cur.execute(
                "UPDATE assessments SET questions = ? WHERE id = ?",
                (json.dumps(questions), assessment_id),
            )
            total_patched_assessments += 1

    conn.commit()
    conn.close()

    print(f"Patched {total_patched_questions} coding question(s) across {total_patched_assessments} assessment(s).")
    if unmatched_titles:
        print(f"\nWARNING: could not match these coding-question titles to a known bank entry "
              f"(they were left as-is; if these are custom/hand-authored questions, "
              f"they need input_pattern/output_pattern added manually): {sorted(unmatched_titles)}")
    print("\nBackfill complete. Restart the backend if it's currently running.")


if __name__ == "__main__":
    main()
