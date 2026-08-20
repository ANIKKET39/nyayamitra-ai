"""
Business logic for the Government Scheme Eligibility Checker.

Matching is done deterministically against data/schemes.json (fast, reliable,
explainable — important for a trust-sensitive civic-tech feature). The LLM
(if configured) is used only to generate a friendlier, personalized
"why you're eligible" narrative on top of the rules-engine result.
"""
import json
import os
from prompts.scheme_prompt import SCHEME_SYSTEM_PROMPT, build_scheme_prompt
from services.ai_client import call_ai

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "schemes.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    SCHEMES = json.load(f)


def _matches(scheme: dict, profile: dict) -> bool:
    elig = scheme["eligibility"]

    income = profile.get("income")
    if income is not None and income > elig.get("max_income", 999999999):
        return False

    age = profile.get("age")
    if age is not None:
        if age < elig.get("min_age", 0) or age > elig.get("max_age", 200):
            return False

    occupation = (profile.get("occupation") or "").lower()
    allowed_occ = [o.lower() for o in elig.get("occupations", ["any"])]
    if "any" not in allowed_occ and occupation and occupation not in allowed_occ:
        return False

    gender = (profile.get("gender") or "").lower()
    allowed_genders = elig.get("genders")
    if allowed_genders and gender and gender not in [g.lower() for g in allowed_genders]:
        return False

    student_status = (profile.get("student_status") or "").lower()
    allowed_student = elig.get("student_status")
    if allowed_student and student_status not in [s.lower() for s in allowed_student]:
        return False

    state = (profile.get("state") or "").lower()
    allowed_states = [s.lower() for s in elig.get("states", ["all"])]
    if "all" not in allowed_states and state and state not in allowed_states:
        return False

    return True


def _default_reasoning(profile: dict, matched: list) -> dict:
    schemes_out = []
    for s in matched:
        reasons = []
        elig = s["eligibility"]
        if profile.get("age") is not None:
            reasons.append(f"your age ({profile['age']}) fits the eligible range")
        if profile.get("income") is not None and elig.get("max_income", 0) < 999999999:
            reasons.append(f"your household income is within the Rs. {elig['max_income']:,} limit")
        if profile.get("occupation"):
            reasons.append(f"your occupation ('{profile['occupation']}') qualifies")
        why = "You are eligible because " + (", and ".join(reasons) if reasons else "you meet the scheme's basic criteria") + "."
        schemes_out.append({
            "scheme_id": s["id"],
            "why_eligible": why,
            "recommended_first_step": f"Visit your nearest Common Service Centre (CSC) or the official portal to apply for {s['name']}, carrying: {', '.join(s['required_documents'][:2])}.",
        })
    return {
        "schemes": schemes_out,
        "encouragement_note": "These benefits exist for citizens like you — it's worth applying today!",
    }


def check_eligibility(profile: dict) -> dict:
    """
    profile keys: age, gender, state, income, occupation, student_status
    Returns: { matched_schemes: [...full scheme objects...], reasoning: {...} }
    """
    matched = [s for s in SCHEMES if _matches(s, profile)]

    def fallback():
        return _default_reasoning(profile, matched)

    if matched:
        user_prompt = build_scheme_prompt(profile, matched)
        reasoning = call_ai(SCHEME_SYSTEM_PROMPT, user_prompt, fallback)
    else:
        reasoning = {"schemes": [], "encouragement_note": "No exact matches found — try adjusting your details, or check back as new schemes are added regularly."}

    return {"matched_schemes": matched, "reasoning": reasoning}


def get_all_schemes():
    return SCHEMES
