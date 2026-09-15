# """
# One-time migration: create the persistent question-bank tables
# (Question, QuestionTestCase, AssessmentSet, AssessmentSetAssignment).

# Run once, from the backend/ directory (same convention as
# migrate_proctoring.py / migrate_add_achievements.py):

#     python migrate_question_bank.py

# Safe to re-run -- create_all() only creates tables that don't already
# exist; it never touches, alters, or drops existing ones.
# """
# from app.database import engine, Base
# from app import question_bank_models  # noqa: F401 -- import registers the new tables on Base.metadata

# if __name__ == "__main__":
#     Base.metadata.create_all(bind=engine)
#     print("Question bank tables created (or already existed):")
#     print(" - question_bank")
#     print(" - question_test_cases")
#     print(" - assessment_sets")
#     print(" - assessment_set_assignments")


"""
Run once, from the backend/ directory:

    python -m app.migrate_question_bank

Safe to re-run -- create_all() only creates tables that don't already
exist; it never touches, alters, or drops existing ones.
"""
from app.database import engine, Base
from app import models              # noqa: F401 -- registers Job/User/etc. so question_bank's FK to jobs.id can resolve
from app import question_bank_models  # noqa: F401 -- import registers the new tables on Base.metadata

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Question bank tables created (or already existed):")
    print(" - question_bank")
    print(" - question_test_cases")
    print(" - assessment_sets")
    print(" - assessment_set_assignments")