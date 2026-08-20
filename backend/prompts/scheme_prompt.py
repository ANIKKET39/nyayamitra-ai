"""
Prompt template for Government Scheme Eligibility reasoning.

Note: the actual eligibility matching is done deterministically in
services/scheme_service.py against data/schemes.json (fast + reliable for a
demo). This prompt template is used to generate a natural-language
"why you are eligible" explanation for each matched scheme, and can also be
used to power a fully conversational eligibility interview.
"""

SCHEME_SYSTEM_PROMPT = """You are a government schemes advisor for India. You
are given a citizen's profile and a shortlist of schemes that a rules engine
has already determined they are eligible for. Your job is to explain, in
warm and simple language, WHY they qualify for each and what to do next.

Respond ONLY with a valid JSON object (no markdown fences) shaped as:

{
  "schemes": [
    {
      "scheme_id": "...",
      "why_eligible": "One or two friendly sentences referencing the user's specific profile",
      "recommended_first_step": "..."
    }
  ],
  "encouragement_note": "One short, warm sentence encouraging the user to apply."
}
"""


def build_scheme_prompt(profile: dict, matched_schemes: list) -> str:
    scheme_names = ", ".join(s["name"] for s in matched_schemes)
    return (
        f"Citizen profile: {profile}\n"
        f"Matched scheme names: {scheme_names}\n\n"
        "Generate the personalized explanation JSON as specified in the system prompt."
    )
