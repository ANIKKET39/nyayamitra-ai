"""
Business logic for the RTI Draft Generator module.
"""
from prompts.rti_prompt import RTI_SYSTEM_PROMPT, build_rti_prompt
from services.ai_client import call_ai


def _rule_based_rti(department: str, issue: str, location: str) -> dict:
    """Deterministic, template-based RTI content generator (offline fallback)."""
    subject = f"Application under Section 6(1) of the Right to Information Act, 2005 seeking information regarding {issue.strip().rstrip('.')} in {location}"

    information_requested = [
        f"Certified copies of all records, files, and correspondence related to '{issue.strip()}' held by the {department}, from the date of the concerned event/application till date.",
        f"The current status and stage of processing of the above matter, including the name and designation of the officer(s) currently handling it.",
        f"The reasons for any delay, if the matter has not been resolved within the prescribed timeline applicable to the {department}.",
        "Details of the grievance redressal mechanism and the officer responsible for addressing complaints related to this matter.",
        "A certified copy of the relevant rules, guidelines, or standard operating procedure (SOP) applicable to this matter.",
    ]

    grounds = (
        f"The applicant is a concerned citizen/resident of {location} seeking transparency and "
        f"accountability regarding the handling of the above matter by the {department}. This "
        f"information is sought in the public interest and to enable the applicant to pursue "
        f"appropriate remedies."
    )

    fee_note = (
        "As per the RTI Act 2005 and rules made thereunder, a fee of Rs. 10/- is enclosed "
        "(via Indian Postal Order / Demand Draft / court fee stamp, as applicable in this "
        "jurisdiction). Applicants belonging to the Below Poverty Line (BPL) category are "
        "exempted from this fee upon submission of proof of BPL status."
    )

    return {
        "subject": subject,
        "information_requested": information_requested,
        "grounds": grounds,
        "fee_note": fee_note,
    }


def generate_rti_content(department: str, issue: str, location: str) -> dict:
    """Generates the structured content (subject, requested info, etc.) for an RTI application."""
    def fallback():
        return _rule_based_rti(department, issue, location)

    user_prompt = build_rti_prompt(department, issue, location)
    result = call_ai(RTI_SYSTEM_PROMPT, user_prompt, fallback)
    return result
