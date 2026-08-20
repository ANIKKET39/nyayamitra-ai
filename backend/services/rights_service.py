"""
Business logic for the Rights Navigator module.

Contains a rule-based "legal knowledge base" matcher used as the offline
fallback (and primary engine when no LLM key is configured) so the feature
always gives grounded, sensible answers to common Indian civic/legal issues.
"""
import re
from prompts.rights_prompt import RIGHTS_SYSTEM_PROMPT, build_rights_prompt
from services.ai_client import call_ai

# Rule-based knowledge base: (keyword patterns) -> structured legal guidance.
# Each entry is checked against the user's query (lowercased) for a keyword hit.
KNOWLEDGE_BASE = [
    {
        "keywords": ["salary", "wage", "employer not paying", "not paid", "unpaid salary", "tankha", "salary nahi"],
        "response": {
            "applicable_rights": [
                "Right to timely payment of wages under the Payment of Wages Act, 1936",
                "Right to file a complaint with the Labour Commissioner",
            ],
            "responsible_authority": "Office of the Labour Commissioner (state) / Industrial Tribunal",
            "required_documents": ["Offer letter / appointment letter", "Salary slips", "Bank statements showing non-payment", "Employment ID proof"],
            "timeline": "Labour Commissioner typically responds within 30-45 days of a formal complaint",
            "next_steps": [
                "Send a written notice to your employer requesting payment within 15 days",
                "If unresolved, file a complaint with the Labour Commissioner's office in your district",
                "You may also approach the Labour Court for wage recovery",
            ],
            "plain_language_summary": "Your employer is legally required to pay your wages on time. If they don't, you can file a written complaint with the Labour Commissioner, who can order recovery of your dues.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["security deposit", "landlord", "rent", "deposit not returned", "makan malik", "kiraya"],
        "response": {
            "applicable_rights": [
                "Right to refund of security deposit under state Rent Control Act / Model Tenancy Act, 2021",
                "Right to an itemized deduction statement if deposit is withheld",
            ],
            "responsible_authority": "Rent Authority / Rent Control Court in your district; Consumer Court in some cases",
            "required_documents": ["Rental agreement", "Proof of deposit payment", "Move-out inspection photos/videos", "Correspondence with landlord"],
            "timeline": "Landlords are generally expected to return deposits within 1-2 months of vacating, per most state tenancy rules",
            "next_steps": [
                "Send a formal written demand letter to the landlord (NyayaMitra can generate this for you)",
                "If ignored, file a complaint with the local Rent Authority",
                "As a last resort, approach the Consumer Disputes Redressal Commission",
            ],
            "plain_language_summary": "Your landlord must return your security deposit (minus legitimate deductions) after you vacate. If they refuse, you can send a legal notice and escalate to the Rent Authority.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["defective product", "refund", "warranty", "consumer", "faulty", "shopkeeper", "online order", "return item"],
        "response": {
            "applicable_rights": [
                "Right to seek refund/replacement/compensation under the Consumer Protection Act, 2019",
                "Right to file complaints online via the National Consumer Helpline / e-Daakhil portal",
            ],
            "responsible_authority": "District Consumer Disputes Redressal Commission",
            "required_documents": ["Purchase invoice/receipt", "Warranty card", "Photos/videos of the defect", "Communication with seller"],
            "timeline": "Consumer complaints are typically expected to be resolved within 3-5 months by the District Commission",
            "next_steps": [
                "First raise the issue with the seller/company in writing and keep records",
                "If unresolved within a reasonable time, file a complaint at consumerhelpline.gov.in or e-daakhil.nic.in",
                "For claims under Rs. 1 crore, approach the District Consumer Commission",
            ],
            "plain_language_summary": "As a consumer you have the right to a refund, replacement or compensation for defective goods or deficient services. You can escalate unresolved complaints to the Consumer Commission.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["police", "fir", "not registering", "complaint not filed", "thana"],
        "response": {
            "applicable_rights": [
                "Right to have an FIR registered for a cognizable offence under Section 154 CrPC / Section 173 BNSS",
                "Right to approach the Superintendent of Police if the local station refuses",
            ],
            "responsible_authority": "Local Police Station; Superintendent of Police (SP); Judicial Magistrate",
            "required_documents": ["Written complaint copy", "Any evidence (photos, messages, witnesses)", "Proof of visiting the police station (if refused)"],
            "timeline": "FIR must be registered immediately for cognizable offences; SP escalation typically resolved in a few days",
            "next_steps": [
                "Submit a written complaint at the police station and get an acknowledgment",
                "If refused, send the complaint by registered post to the Superintendent of Police",
                "You may also file a complaint before the Judicial Magistrate under Section 156(3) CrPC",
            ],
            "plain_language_summary": "The police are legally bound to register an FIR for a cognizable offence. If they refuse, you can escalate to the SP or approach a magistrate directly.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["ration card", "pds", "food", "ration nahi mil raha"],
        "response": {
            "applicable_rights": [
                "Right to subsidized food grains under the National Food Security Act, 2013",
                "Right to file a grievance with the District Food & Supplies Office",
            ],
            "responsible_authority": "District Food & Civil Supplies Office / State PDS Grievance portal",
            "required_documents": ["Ration card / application acknowledgment", "Aadhaar Card", "Income proof (if applying fresh)"],
            "timeline": "Grievances are usually addressed within 30 days",
            "next_steps": [
                "Check your ration card status on your state's PDS portal",
                "File a written grievance with the District Food & Supplies Office",
                "Escalate to the State Food Commission if unresolved",
            ],
            "plain_language_summary": "You have a legal right to subsidized food grains under the National Food Security Act. Non-supply can be reported to the District Food Office.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["workplace", "harassment", "boss", "office", "posh", "colleague"],
        "response": {
            "applicable_rights": [
                "Right to a safe workplace under the POSH Act, 2013 (for harassment)",
                "Right to raise grievances under company HR policy / Industrial Employment (Standing Orders) Act",
            ],
            "responsible_authority": "Internal Complaints Committee (ICC) of the organization; Labour Commissioner",
            "required_documents": ["Written record of incidents with dates", "Emails/messages as evidence", "Witness details, if any"],
            "timeline": "ICC is legally required to complete inquiry within 90 days",
            "next_steps": [
                "File a written complaint with your organization's Internal Complaints Committee",
                "If no ICC exists or the issue is unresolved, approach the Local Complaints Committee (LCC) in your district",
                "You may also file a complaint with the Labour Commissioner for other workplace grievances",
            ],
            "plain_language_summary": "You have the right to a safe and fair workplace. Harassment complaints go to your organization's Internal Complaints Committee, and other grievances can go to the Labour Commissioner.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
    {
        "keywords": ["municipal", "garbage", "road", "streetlight", "water supply", "sewage", "nagar nigam"],
        "response": {
            "applicable_rights": [
                "Right to basic civic services from your Urban/Rural Local Body",
                "Right to file grievances via municipal grievance redressal systems",
            ],
            "responsible_authority": "Municipal Corporation / Municipal Council / Gram Panchayat",
            "required_documents": ["Photos of the issue", "Location details", "Previous complaint reference numbers, if any"],
            "timeline": "Most municipal grievance portals commit to resolution within 7-15 days",
            "next_steps": [
                "Register the complaint on your city's municipal grievance portal or app (e.g. Swachh app, 311 apps)",
                "If unresolved, escalate in writing to the Municipal Commissioner",
                "Use RTI to ask why the issue remains unresolved, if needed",
            ],
            "plain_language_summary": "Civic issues like garbage, roads and water supply are the responsibility of your local municipal body, and you can formally escalate unresolved complaints to the Commissioner.",
            "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
        },
    },
]

DEFAULT_RESPONSE = {
    "applicable_rights": [
        "Right to Information under the RTI Act, 2005",
        "Right to file grievances with the concerned government department",
    ],
    "responsible_authority": "The government department or authority directly concerned with your issue",
    "required_documents": ["Aadhaar Card", "Any documents related to your issue (receipts, notices, correspondence)"],
    "timeline": "Varies by department; RTI responses are legally required within 30 days",
    "next_steps": [
        "Identify the specific department responsible for your issue",
        "File a written complaint or RTI application with that department",
        "Escalate to the department's grievance redressal officer if unresolved",
    ],
    "plain_language_summary": "We couldn't pinpoint an exact legal category for your issue, but every citizen has the right to information and grievance redressal from government departments. Try rephrasing with more detail, or use our RTI Generator to formally request information.",
    "disclaimer": "This is general legal information, not a substitute for a licensed lawyer.",
}


def _rule_based_match(user_query: str) -> dict:
    q = user_query.lower()
    for entry in KNOWLEDGE_BASE:
        if any(re.search(re.escape(kw), q) for kw in entry["keywords"]):
            return entry["response"]
    return DEFAULT_RESPONSE


def get_rights_guidance(user_query: str, language: str = "en") -> dict:
    """
    Returns structured legal guidance for a user's plain-language problem
    description. Uses the live LLM if configured, otherwise a rule-based
    knowledge base matcher.
    """
    def fallback():
        return _rule_based_match(user_query)

    user_prompt = build_rights_prompt(user_query, language)
    result = call_ai(RIGHTS_SYSTEM_PROMPT, user_prompt, fallback)
    return result
