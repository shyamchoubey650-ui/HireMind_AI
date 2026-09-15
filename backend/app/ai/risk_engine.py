

"""
HireMind AI - Proctoring Risk Engine

Centralized risk scoring for assessment monitoring events.

The frontend/candidate-side proctoring system detects events such as:
- TAB_SWITCH
- FULLSCREEN_EXIT
- CAMERA_DISCONNECTED
- NO_FACE
- MULTIPLE_FACES
- PHONE_DETECTED
- SUSPICIOUS_KEYBOARD_ACTION
- WINDOW_BLUR
- PAGE_RELOAD
- SUSPICIOUS_AUDIO
- TIMEOUT

This module DOES NOT detect these events.
It only assigns risk points and calculates the overall risk score.

Detection happens on the candidate side.
Scoring happens here.
The recruiter dashboard displays the result.
"""


# ============================================================
# EVENT RISK CONFIGURATION
# ============================================================

EVENT_RISK = {

    # --------------------------------------------------------
    # Browser / focus violations
    # --------------------------------------------------------

    "TAB_SWITCH": {
        "points": 25,
        "severity": "high",
        "label": "Tab switch detected",
    },

    "FULLSCREEN_EXIT": {
        "points": 25,
        "severity": "high",
        "label": "Fullscreen mode exited",
    },

    "WINDOW_BLUR": {
        "points": 8,
        "severity": "medium",
        "label": "Assessment window lost focus",
    },

    "PAGE_RELOAD": {
        "points": 5,
        "severity": "low",
        "label": "Assessment page reloaded",
    },

    # --------------------------------------------------------
    # Camera / face monitoring
    # --------------------------------------------------------

    "CAMERA_DISCONNECTED": {
        "points": 20,
        "severity": "high",
        "label": "Camera disconnected",
    },

    "NO_FACE": {
        "points": 15,
        "severity": "medium",
        "label": "Candidate face not detected",
    },

    "MULTIPLE_FACES": {
        "points": 30,
        "severity": "high",
        "label": "Multiple faces detected",
    },

    "PHONE_DETECTED": {
        "points": 30,
        "severity": "high",
        "label": "Mobile phone detected",
    },

    "SUSPICIOUS_OBJECT": {
        "points": 20,
        "severity": "high",
        "label": "Suspicious object detected",
    },

    # --------------------------------------------------------
    # Audio monitoring
    # --------------------------------------------------------

    "SUSPICIOUS_AUDIO": {
        "points": 10,
        "severity": "medium",
        "label": "Unusual audio activity detected",
    },

    # --------------------------------------------------------
    # Keyboard / interaction monitoring
    # --------------------------------------------------------

    "SUSPICIOUS_KEYBOARD_ACTION": {
        "points": 10,
        "severity": "medium",
        "label": "Suspicious keyboard action detected",
    },

    "COPY_ATTEMPT": {
        "points": 10,
        "severity": "medium",
        "label": "Copy action detected",
    },

    "PASTE_ATTEMPT": {
        "points": 10,
        "severity": "medium",
        "label": "Paste action detected",
    },

    # --------------------------------------------------------
    # Session security
    # --------------------------------------------------------

    "DUPLICATE_SESSION": {
        "points": 20,
        "severity": "high",
        "label": "Duplicate assessment session detected",
    },

    # --------------------------------------------------------
    # Assessment lifecycle
    # --------------------------------------------------------

    "TIMEOUT": {
        "points": 0,
        "severity": "low",
        "label": "Assessment timed out",
    },
}


# Unknown events should not silently disappear.
DEFAULT_RISK = {
    "points": 5,
    "severity": "medium",
    "label": "Unknown security event",
}


# ============================================================
# SCORE ONE EVENT
# ============================================================

def score_event(event_type: str) -> dict:
    """
    Return the risk configuration for one security event.

    Example:

        score_event("TAB_SWITCH")

    returns:

        {
            "points": 25,
            "severity": "high",
            "label": "Tab switch detected"
        }
    """

    if not event_type:
        return DEFAULT_RISK

    return EVENT_RISK.get(
        event_type.upper(),
        DEFAULT_RISK
    )


# ============================================================
# AGGREGATE RISK
# ============================================================

# How much a REPEAT of the same event type counts for, relative to its
# first occurrence. Without this, five PHONE_DETECTED events (one
# genuinely sustained violation, re-reported every time the cooldown
# window passes) summed to 150+ points -- capped at 100, but reaching
# that cap almost immediately regardless of how varied or serious the
# actual behavior was. A candidate who triggers one type five times and
# a candidate who triggers five DIFFERENT violation types should not
# land at the same "High risk" score -- the second is the more
# concerning pattern. The first occurrence of a type still counts in
# full; every occurrence after that counts for this fraction instead.
REPEAT_DECAY = 0.25


def aggregate_risk(events: list) -> dict:
    """
    Calculate the overall risk score.

    `events` can contain dictionaries:

        {
            "risk_points": 25,
            "event_type": "TAB_SWITCH",   # optional but recommended
        }

    or objects with `.risk_points` (and optionally `.event_type`).

    When `event_type` is present, repeats of the SAME type beyond the
    first are discounted by REPEAT_DECAY (see above) before being added
    to the total. When it's absent (older callers that only ever
    supplied risk_points), every occurrence is added in full, exactly
    as before -- this keeps any caller that hasn't been updated to
    pass event_type working the same way it always did, just without
    the anti-inflation benefit.

    The final score is still capped at 100.

    Returns:

        {
            "score": 50,
            "band": "medium"
        }
    """

    total = 0.0
    seen_counts = {}

    for event in events:

        if hasattr(event, "risk_points"):
            points = event.risk_points
            event_type = getattr(event, "event_type", None)

        elif isinstance(event, dict):
            points = event.get("risk_points", 0)
            event_type = event.get("event_type")

        else:
            points = 0
            event_type = None

        points = points or 0

        if event_type:
            occurrence_index = seen_counts.get(event_type, 0)
            seen_counts[event_type] = occurrence_index + 1

            if occurrence_index == 0:
                total += points
            else:
                total += points * REPEAT_DECAY
        else:
            # No event_type to dedupe against -- add in full, same as
            # the old behavior.
            total += points

    # Never allow score above 100.
    total = min(round(total), 100)

    # --------------------------------------------------------
    # Risk bands
    # --------------------------------------------------------

    if total == 0:
        band = "clean"

    elif total <= 20:
        band = "low"

    elif total <= 50:
        band = "medium"

    else:
        band = "high"

    return {
        "score": total,
        "band": band,
    }


# ============================================================
# HELPER - GET EVENT INFORMATION
# ============================================================

def get_event_info(event_type: str) -> dict:
    """
    Return complete information about an event.

    Useful for the recruiter UI or other backend services.
    """

    return score_event(event_type)


# ============================================================
# HELPER - CALCULATE RISK FROM EVENT TYPES
# ============================================================

def calculate_risk_from_event_types(event_types: list[str]) -> dict:
    """
    Convenience function for calculating risk directly
    from a list of event types.

    Example:

        calculate_risk_from_event_types([
            "TAB_SWITCH",
            "PHONE_DETECTED"
        ])

    Result:

        {
            "score": 55,
            "band": "high"
        }
    """

    events = []

    for event_type in event_types:
        scoring = score_event(event_type)

        events.append({
            "risk_points": scoring["points"],
            "event_type": event_type,
        })

    return aggregate_risk(events)
