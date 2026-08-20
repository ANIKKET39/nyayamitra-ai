"""
Business logic for the Complaint Letter Generator module.
"""
from prompts.complaint_prompt import COMPLAINT_SYSTEM_PROMPT, build_complaint_prompt
from services.ai_client import call_ai

LAW_REFERENCE = {
    "consumer": "Consumer Protection Act, 2019",
    "landlord": "Model Tenancy Act, 2021 / applicable State Rent Control Act",
    "workplace": "Industrial Disputes Act, 1947 (and POSH Act, 2013 where applicable)",
    "municipal": "Municipal Corporation Act / civic duties of the Urban Local Body",
}

OPENING = {
    "consumer": "I am writing to formally lodge a complaint regarding a product/service I purchased which has not met the standards promised.",
    "landlord": "I am writing to formally raise a concern regarding my tenancy, specifically the matter detailed below.",
    "workplace": "I am writing to formally raise a workplace grievance regarding the matter described below.",
    "municipal": "I am writing to bring to your attention a civic issue in my locality that requires urgent redressal.",
}


def _rule_based_complaint(complaint_type: str, details: dict) -> dict:
    subject_map = {
        "consumer": f"Re: Complaint regarding defective/unsatisfactory product or service - {details.get('subject_hint', '')}",
        "landlord": f"Re: Complaint regarding {details.get('subject_hint', 'tenancy issue')}",
        "workplace": f"Re: Workplace grievance regarding {details.get('subject_hint', 'the matter described')}",
        "municipal": f"Re: Civic complaint regarding {details.get('subject_hint', 'unresolved municipal issue')}",
    }

    body_paragraphs = [
        details.get("description", "Please find the details of my complaint described in this letter."),
        f"I have already attempted to resolve this matter informally, without success. I am now escalating this through formal channels as I am entitled to do under the {LAW_REFERENCE.get(complaint_type, 'applicable law')}.",
    ]

    desired_resolution_paragraph = (
        f"I request that this matter be resolved within 15 days of receipt of this letter. "
        f"Specifically, I am seeking: {details.get('desired_resolution', 'a fair and prompt resolution to this issue')}. "
        f"Should this matter remain unresolved, I will be compelled to escalate it to the appropriate "
        f"regulatory/legal authority."
    )

    closing_paragraph = (
        "I trust that you will treat this matter with the seriousness it deserves and look forward to "
        "your prompt response. Please feel free to contact me using the details provided below for any "
        "clarification."
    )

    return {
        "subject": subject_map.get(complaint_type, "Re: Formal Complaint"),
        "opening_paragraph": OPENING.get(complaint_type, "I am writing to formally raise a complaint regarding the matter described below."),
        "body_paragraphs": body_paragraphs,
        "desired_resolution_paragraph": desired_resolution_paragraph,
        "closing_paragraph": closing_paragraph,
        "relevant_law_reference": LAW_REFERENCE.get(complaint_type, "Applicable Indian civil/consumer law"),
    }


def generate_complaint_content(complaint_type: str, details: dict) -> dict:
    def fallback():
        return _rule_based_complaint(complaint_type, details)

    user_prompt = build_complaint_prompt(complaint_type, details)
    result = call_ai(COMPLAINT_SYSTEM_PROMPT, user_prompt, fallback)
    return result
