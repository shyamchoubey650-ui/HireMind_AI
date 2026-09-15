"""
regenerate_coding_testcases.py

One-off repair script: brings coding questions on EXISTING Assessment rows
up to date with the current CODING_BANK in app/ai/assessment_ai.py.

WHY THIS EXISTS
----------------
generate_assessment_questions() only runs once, at the moment an
Assessment is created (see assessments_router.create_assessment). The
resulting question list is frozen into the assessments.questions JSON
column. Any improvement made to CODING_BANK since then -- more test
cases, richer problem statements, corrected input_pattern/output_pattern
-- has zero effect on assessments that already exist. This script
retroactively patches them in place, matched by problem title.

WHAT IT UPDATES (per coding question, matched by title against
CODING_BANK):
    visible_test_cases, hidden_test_cases, input_pattern, output_pattern,
    problem_statement, input_format, output_format, constraints, examples,
    difficulty
It leaves untouched: id, marks, skill_tag, starter_code, allowed_languages
-- these either must stay stable (id is referenced by in-flight
submissions' `answers` dict) or are already fine as stored.

WHAT IT DOES NOT TOUCH: MCQ/fill-blank questions, non-coding fields, or
any AssessmentSubmission row. Existing scores for submissions already
marked "scored" are untouched (a past score is a historical record, not
recomputed). A submission still "in_progress" will, if it later reaches
/submit, be graded against the UPDATED hidden_test_cases -- functionally
fine (grading always re-reads assessment.questions live), but note it
means a candidate mid-attempt could see their visible test count change
if they reload during the window this script runs. Running it outside
active exam hours is the safe option.

USAGE
-----
    cd backend
    python regenerate_coding_testcases.py            # dry run (default) -- reports only, writes nothing
    python regenerate_coding_testcases.py --apply     # actually commits the changes

Dry run first. Read its output before re-running with --apply.
"""
import argparse
import sys

sys.path.insert(0, ".")

from app.database import SessionLocal  # adjust import if your project's
from app import models                  # session/model modules differ --
from app.ai.assessment_ai import CODING_BANK  # see the docstring above

try:
    from sqlalchemy.orm.attributes import flag_modified
except ImportError:
    flag_modified = None

BANK_BY_TITLE = {item["title"]: item for item in CODING_BANK}

FIELDS_TO_SYNC = [
    "visible_test_cases",
    "hidden_test_cases",
    "input_pattern",
    "output_pattern",
    "problem_statement",
    "input_format",
    "output_format",
    "constraints",
    "examples",
    "difficulty",
]


def build_updated_questions(questions):
    """Returns (new_questions_list, changed: bool, report: list[str])."""
    new_questions = []
    changed = False
    report = []

    for q in questions:
        if q.get("type") != "coding":
            new_questions.append(q)
            continue

        bank_item = BANK_BY_TITLE.get(q.get("question"))
        if not bank_item:
            # Not a CODING_BANK problem (e.g. a recruiter hand-authored
            # this one) -- leave it exactly as-is, don't guess.
            new_questions.append(q)
            report.append(f"    SKIP (no CODING_BANK match): {q.get('question')!r}")
            continue

        old_visible = len(q.get("visible_test_cases") or [])
        old_hidden = len(q.get("hidden_test_cases") or [])
        old_pattern = (q.get("input_pattern"), q.get("output_pattern"))

        new_q = dict(q)  # fresh dict -- never mutate q in place
        for field in FIELDS_TO_SYNC:
            new_q[field] = bank_item[field]

        new_visible = len(new_q["visible_test_cases"])
        new_hidden = len(new_q["hidden_test_cases"])
        new_pattern = (new_q["input_pattern"], new_q["output_pattern"])

        if (old_visible, old_hidden, old_pattern) != (new_visible, new_hidden, new_pattern):
            changed = True
            report.append(
                f"    UPDATE {q.get('question')!r}: "
                f"visible {old_visible}->{new_visible}, hidden {old_hidden}->{new_hidden}, "
                f"pattern {old_pattern}->{new_pattern}"
            )
        else:
            report.append(f"    up to date: {q.get('question')!r}")

        new_questions.append(new_q)

    return new_questions, changed, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Actually commit changes (default is dry-run).")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        assessments = db.query(models.Assessment).all()
        print(f"Found {len(assessments)} assessment(s).\n")

        total_changed = 0
        for a in assessments:
            new_questions, changed, report = build_updated_questions(a.questions or [])
            print(f"Assessment #{a.id} ({a.title!r}):")
            for line in report:
                print(line)

            if changed:
                total_changed += 1
                if args.apply:
                    a.questions = new_questions  # reassignment, not in-place
                    # mutation -- this alone is enough for SQLAlchemy to
                    # detect the change on a JSON column, but flag_modified
                    # is added as a defensive backstop in case any part of
                    # this ever gets refactored to mutate in place instead.
                    if flag_modified:
                        flag_modified(a, "questions")
                    print("    -> WRITTEN")
                else:
                    print("    -> would update (dry run, nothing written)")
            print()

        if args.apply and total_changed:
            db.commit()
            print(f"Committed updates to {total_changed} assessment(s).")
        elif not args.apply and total_changed:
            print(f"{total_changed} assessment(s) would be updated. Re-run with --apply to write changes.")
        else:
            print("Nothing to update -- all assessments already match the current CODING_BANK.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
