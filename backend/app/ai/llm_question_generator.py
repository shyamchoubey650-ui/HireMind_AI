"""
LLM-backed question generation (Phase: hybrid AI + recruiter question bank).

This module is ONLY reached by set_generator.py's ensure_unique_questions()
as the LAST tier, after:
  1. Whatever's already persisted in the question bank for this job/type
     (recruiter-created OR previously AI-generated) is reused.
  2. The existing free, hardcoded assessment_ai.py pool (SKILL_BANK /
     GENERIC_*_POOL / CODING_BANK) is exhausted.

Only when a deficit remains after both of those does this module get
imported and called -- so existing behavior for small/medium set counts
that the hardcoded pool already covers is completely unchanged, and no
OpenAI API call happens unless one is actually needed.

WHY THIS MODULE NEVER TALKS TO THE DATABASE:
Duplicate-checking and persistence stay owned by set_generator.py /
question_bank_ai.py, exactly like the hardcoded-pool path already works.
This module's only job is: given constraints, return CANDIDATE dicts in
the same shape assessment_ai.py's hardcoded pool items use, so they can
be fed through the EXISTING _finalize_mcq / _finalize_fill_blank /
_finalize_coding functions unchanged. Nothing here decides what's a
duplicate or what gets saved -- that keeps duplicate detection identical
regardless of which source (recruiter, hardcoded pool, or LLM) a
question came from.

CODING QUESTIONS -- WHY THE PATTERN LIST IS FIXED:
code_executor.py's C++/Java drivers only implement main() functions for
these 8 exact (input_pattern, output_pattern) pairs (see code_executor.py
_CPP_MAIN / _JAVA_MAIN dict keys). Python/JS drivers are more generic but
still only handle these same input/output pattern NAMES. If the LLM
invented a 9th pattern, that question would have no working C++/Java
driver and would silently never execute correctly for those languages.
So the prompt below constrains the model to pick ONE of these 8, with
an exact description of the input/output format each one requires --
copied directly from code_executor.py's _PY_DRIVER / _CPP_MAIN so the
LLM's test cases are actually consumable by the real judge.

IMPORTANT CAVEAT (flagging honestly, not silently): this module does NOT
execute a reference solution to verify the LLM's own test cases are
internally consistent (e.g. that "solve([2,7,11,15], 9)" really does
equal "0 1" for the LLM's intended algorithm). It validates SHAPE
(right field names, right test-case counts, output format matches the
declared pattern) but not mathematical correctness of the LLM's answer
key. This is the same trust level recruiter-typed test cases already
have in this system (question_bank_router.py's add_test_case doesn't
verify correctness either) -- not a new gap introduced here, but worth
knowing about.
"""
import json
import os
import random
from typing import Dict, List

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
# Coding problems are more failure-prone (more fields, stricter format
# requirements) than MCQ/fill-blank -- allow a stronger model for just
# this type without forcing it for the cheaper/simpler question types.
OPENAI_CODING_MODEL = os.environ.get("OPENAI_CODING_MODEL", OPENAI_MODEL)


class LLMGenerationError(Exception):
    """Raised when the LLM tier can't be used at all (e.g. no API key
    configured, or the openai package isn't installed) -- distinct from
    "the model returned something we rejected," which is handled by
    returning fewer/zero valid items rather than raising."""
    pass


def _client():
    try:
        from openai import OpenAI
    except ImportError as e:
        raise LLMGenerationError(
            "The 'openai' package isn't installed. Add openai>=1.30.0 to "
            "requirements.txt and pip install it to use AI question generation."
        ) from e

    try:
        return OpenAI()  # reads OPENAI_API_KEY from the environment itself
    except Exception as e:
        raise LLMGenerationError(
            "OPENAI_API_KEY isn't set. Set it as an environment variable "
            "before starting the backend (see .env.example)."
        ) from e


def _chat_json(model: str, system_prompt: str, user_prompt: str) -> dict:
    """Calls the chat completion endpoint in JSON mode and parses the
    result. Returns {} (not an exception) on any parse/API failure, so
    callers can treat it as a failed attempt and retry within their own
    bounded retry budget, rather than this module deciding how many
    times to retry."""
    client = _client()
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.9,
        )
        raw = resp.choices[0].message.content
        return json.loads(raw)
    except LLMGenerationError:
        raise
    except Exception:
        return {}


def _exclusion_block(exclude_texts: List[str]) -> str:
    if not exclude_texts:
        return "(none yet)"
    # Cap how many we paste into the prompt -- this is a soft hint to
    # the model, not the authoritative duplicate check (that's
    # question_bank_ai.is_duplicate, applied by the caller to every
    # item this module returns), so a long tail of older questions
    # doesn't need to be included for the check itself to work.
    shown = exclude_texts[-100:]
    return "\n".join(f"- {t}" for t in shown)


# ============================================================
# MCQ
# ============================================================

def generate_mcq_batch(skills: List[str], exclude_texts: List[str], count: int) -> List[dict]:
    skills_str = ", ".join(skills) if skills else "general software engineering"
    system_prompt = (
        "You are generating multiple-choice interview assessment questions. "
        "Respond ONLY with a JSON object: {\"items\": [...]}. Each item must have "
        "EXACTLY these keys: \"question\" (string), \"options\" (array of exactly "
        "4 distinct strings), \"correct_answer\" (string that is an EXACT match "
        "of one of the 4 options), \"difficulty\" (one of \"easy\", \"medium\", "
        "\"hard\"), \"skill_tag\" (a single lowercase skill/topic word this "
        "question is about)."
    )
    user_prompt = (
        f"Generate {count} multiple-choice questions for a technical assessment "
        f"covering these skills: {skills_str}.\n\n"
        "Do not reuse, paraphrase, or lightly reword any of these already-used "
        f"questions:\n{_exclusion_block(exclude_texts)}\n\n"
        "Generate conceptually distinct questions covering different sub-topics."
    )
    data = _chat_json(OPENAI_MODEL, system_prompt, user_prompt)
    items = data.get("items", []) if isinstance(data, dict) else []
    return [item for item in items if _valid_mcq_item(item)]


def _valid_mcq_item(item) -> bool:
    if not isinstance(item, dict):
        return False
    if not item.get("question") or not isinstance(item.get("options"), list):
        return False
    if len(item["options"]) != 4 or len(set(item["options"])) != 4:
        return False
    if item.get("correct_answer") not in item["options"]:
        return False
    if item.get("difficulty") not in ("easy", "medium", "hard"):
        item["difficulty"] = "medium"  # tolerate a missing/odd value rather than reject outright
    return True


# ============================================================
# FILL IN THE BLANK
# ============================================================

def generate_fill_blank_batch(skills: List[str], exclude_texts: List[str], count: int) -> List[dict]:
    skills_str = ", ".join(skills) if skills else "general software engineering"
    system_prompt = (
        "You are generating fill-in-the-blank interview assessment questions. "
        "Respond ONLY with a JSON object: {\"items\": [...]}. Each item must have "
        "EXACTLY these keys: \"question\" (string containing the literal "
        "characters ______ marking the blank), \"expected_answer\" (string, the "
        "single correct answer), \"accepted_answers\" (array of strings, "
        "alternate acceptable spellings/phrasings, MUST include "
        "expected_answer), \"skill_tag\" (a single lowercase skill/topic word)."
    )
    user_prompt = (
        f"Generate {count} fill-in-the-blank questions for a technical "
        f"assessment covering these skills: {skills_str}.\n\n"
        "Do not reuse, paraphrase, or lightly reword any of these already-used "
        f"questions:\n{_exclusion_block(exclude_texts)}\n\n"
        "Generate conceptually distinct questions covering different sub-topics."
    )
    data = _chat_json(OPENAI_MODEL, system_prompt, user_prompt)
    items = data.get("items", []) if isinstance(data, dict) else []
    return [item for item in items if _valid_fill_blank_item(item)]


def _valid_fill_blank_item(item) -> bool:
    if not isinstance(item, dict):
        return False
    if not item.get("question") or "______" not in item["question"]:
        return False
    if not item.get("expected_answer"):
        return False
    accepted = item.get("accepted_answers")
    if not isinstance(accepted, list) or not accepted:
        item["accepted_answers"] = [item["expected_answer"]]
    elif item["expected_answer"] not in accepted:
        accepted.append(item["expected_answer"])
    return True


# ============================================================
# CODING
# ============================================================

# Must stay in sync with code_executor.py's _CPP_MAIN / _JAVA_MAIN dict
# keys -- these are the only (input_pattern, output_pattern) pairs that
# have a working C++ and Java driver. See module docstring.
VALID_CODING_PATTERNS = [
    ("count_then_list", "int"),
    ("single_string", "string"),
    ("single_string", "bool_lower"),
    ("single_int", "string_lines"),
    ("single_int", "int"),
    ("single_int", "bool_lower"),
    ("list_then_target", "int_pair"),
    ("list_then_target", "int"),
]

_PATTERN_FORMAT_DESCRIPTIONS = {
    "count_then_list": "First stdin line: an integer n (the count). Second stdin line: n space-separated integers.",
    "single_string": "Single stdin line: the string s (no extra formatting).",
    "single_int": "Single stdin line: an integer n.",
    "list_then_target": "First stdin line: space-separated integers (the array). Second stdin line: a single integer target.",
}
_OUTPUT_FORMAT_DESCRIPTIONS = {
    "int": "A single integer, printed alone.",
    "string": "The output string, printed alone (no quotes).",
    "bool_lower": "The lowercase literal string \"true\" or \"false\" (not Python/JS booleans).",
    "string_lines": "Multiple lines, one value per line.",
    "int_pair": "Two integers on one line separated by a single space, e.g. \"0 1\".",
}
REQUIRED_STARTER_LANGS = ["python", "javascript", "java", "cpp"]


def generate_coding_batch(skills: List[str], exclude_texts: List[str], count: int) -> List[dict]:
    skills_str = ", ".join(skills) if skills else "general algorithms/data structures"

    pattern_descriptions = "\n".join(
        f'- input_pattern="{ip}", output_pattern="{op}" -> input: {_PATTERN_FORMAT_DESCRIPTIONS[ip]} '
        f'output: {_OUTPUT_FORMAT_DESCRIPTIONS[op]}'
        for ip, op in VALID_CODING_PATTERNS
    )

    system_prompt = (
        "You are generating coding-interview assessment questions with a "
        "candidate function named `solve`. Respond ONLY with a JSON object: "
        "{\"items\": [...]}. Each item must have EXACTLY these keys: "
        "\"title\" (short string), \"problem_statement\" (string, 2-4 "
        "sentences describing the task and the `solve` function's expected "
        "behavior), \"input_format\" (string), \"output_format\" (string), "
        "\"constraints\" (string), \"examples\" (array of 2 objects each with "
        "\"input\", \"output\", \"explanation\" string keys), \"starter_code\" "
        "(object with EXACTLY these 4 keys: \"python\", \"javascript\", "
        "\"java\", \"cpp\", each an empty-body stub for a `solve` function in "
        "that language matching the input/output pattern below), "
        "\"visible_test_cases\" (array of EXACTLY 3 objects each with "
        "\"input\", \"output\" string keys), \"hidden_test_cases\" (array of "
        "EXACTLY 10 objects each with \"input\", \"output\" string keys), "
        "\"difficulty\" (one of \"easy\", \"medium\", \"hard\"), "
        "\"input_pattern\" (string), \"output_pattern\" (string).\n\n"
        "input_pattern and output_pattern MUST be one of these exact pairs, "
        "and every test case's \"input\"/\"output\" string MUST follow that "
        f"pair's format exactly:\n{pattern_descriptions}\n\n"
        "All test case input/output values must be internally consistent "
        "with each other and with the problem statement you write -- work "
        "out the correct answer for each test case yourself before writing it."
    )
    user_prompt = (
        f"Generate {count} coding problems for a technical assessment "
        f"covering these skills: {skills_str}.\n\n"
        "Do not reuse, paraphrase, or lightly reword any of these already-used "
        f"problems:\n{_exclusion_block(exclude_texts)}\n\n"
        "Generate conceptually distinct problems (different algorithms/data "
        "structures from each other, not just renamed variables)."
    )
    data = _chat_json(OPENAI_CODING_MODEL, system_prompt, user_prompt)
    items = data.get("items", []) if isinstance(data, dict) else []
    return [item for item in items if _valid_coding_item(item)]


def _valid_coding_item(item) -> bool:
    if not isinstance(item, dict):
        return False
    required_keys = [
        "title", "problem_statement", "input_format", "output_format",
        "constraints", "examples", "starter_code", "visible_test_cases",
        "hidden_test_cases", "input_pattern", "output_pattern",
    ]
    if not all(item.get(k) for k in required_keys):
        return False
    if (item["input_pattern"], item["output_pattern"]) not in VALID_CODING_PATTERNS:
        return False
    if not isinstance(item["starter_code"], dict) or not all(
        lang in item["starter_code"] for lang in REQUIRED_STARTER_LANGS
    ):
        return False
    if not isinstance(item["visible_test_cases"], list) or len(item["visible_test_cases"]) != 3:
        return False
    if not isinstance(item["hidden_test_cases"], list) or len(item["hidden_test_cases"]) != 10:
        return False
    for tc in item["visible_test_cases"] + item["hidden_test_cases"]:
        if not isinstance(tc, dict) or "input" not in tc or "output" not in tc:
            return False
    if item.get("difficulty") not in ("easy", "medium", "hard"):
        item["difficulty"] = "medium"
    return True


def generate_batch(question_type: str, skills: List[str], exclude_texts: List[str], count: int) -> List[dict]:
    """Single dispatch entrypoint set_generator.py calls, so it doesn't
    need to know these three functions exist separately."""
    if question_type == "mcq":
        return generate_mcq_batch(skills, exclude_texts, count)
    elif question_type == "fill_blank":
        return generate_fill_blank_batch(skills, exclude_texts, count)
    elif question_type == "coding":
        return generate_coding_batch(skills, exclude_texts, count)
    return []
