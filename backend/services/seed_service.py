"""
seed_service.py — reusable, idempotent demo-data seeding logic.
Used by both the standalone seed_demo_data.py script and the /api/seed
endpoint (for hosting environments like Render's free tier that don't
provide shell access).
"""
from sqlalchemy.orm import Session
from database.models import User, RTIDocument, Complaint, EligibilityHistory, ChatMessage
from services.rti_service import generate_rti_content
from services.complaint_service import generate_complaint_content
from services.pdf_service import generate_rti_pdf, generate_complaint_pdf
import uuid


def seed_if_empty(db: Session) -> dict:
    """Seeds demo data only if the database is currently empty. Safe to call multiple times."""
    existing = db.query(RTIDocument).count()
    if existing > 0:
        return {"status": "skipped", "message": "Demo data already exists, skipping seeding."}

    demo_user = User(name="Ramesh Kumar", email="ramesh.demo@example.com", phone="9876543210", state="Delhi")
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    rti_samples = [
        {"department": "Municipal Corporation of Delhi", "issue": "delay in issuing birth certificate",
         "location": "Delhi", "name": "Ramesh Kumar", "address": "123 Model Town, Delhi", "contact": "9876543210"},
        {"department": "Public Works Department, Punjab", "issue": "status of road repair complaint filed 6 months ago",
         "location": "Ludhiana, Punjab", "name": "Simran Kaur", "address": "45 Civil Lines, Ludhiana", "contact": "9988776655"},
    ]
    for s in rti_samples:
        content = generate_rti_content(s["department"], s["issue"], s["location"])
        record = RTIDocument(
            user_id=demo_user.id, department=s["department"], issue=s["issue"], location=s["location"],
            applicant_name=s["name"], applicant_address=s["address"], applicant_contact=s["contact"],
            subject=content["subject"], information_requested="\n".join(content["information_requested"]),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        pdf_path = generate_rti_pdf(
            doc_id=record.id, applicant_name=s["name"], applicant_address=s["address"],
            applicant_contact=s["contact"], department=s["department"], location=s["location"],
            subject=content["subject"], information_requested=content["information_requested"],
            grounds=content.get("grounds", ""), fee_note=content.get("fee_note", ""),
        )
        record.pdf_path = pdf_path
        db.commit()

    complaint_samples = [
        {"type": "consumer", "subject_hint": "defective washing machine", "recipient": "HomeElectro Pvt Ltd",
         "desc": "I purchased a washing machine on 5th July which stopped working within 10 days.",
         "resolution": "full refund"},
        {"type": "landlord", "subject_hint": "security deposit not returned", "recipient": "Mr. Suresh Sharma (Landlord)",
         "desc": "I vacated the rented flat on 1st June and my landlord has not returned my Rs. 30,000 deposit.",
         "resolution": "return of deposit within 15 days"},
        {"type": "municipal", "subject_hint": "garbage not collected for 3 weeks", "recipient": "Municipal Corporation, Ward 12",
         "desc": "Garbage has not been collected on my street for over three weeks, creating a health hazard.",
         "resolution": "immediate garbage collection and regular schedule"},
    ]
    for c in complaint_samples:
        details = {"subject_hint": c["subject_hint"], "description": c["desc"], "desired_resolution": c["resolution"]}
        content = generate_complaint_content(c["type"], details)
        record = Complaint(
            user_id=demo_user.id, complaint_type=c["type"], recipient_name=c["recipient"],
            applicant_name="Ramesh Kumar", applicant_address="123 Model Town, Delhi", applicant_contact="9876543210",
            subject=content["subject"], details=c["desc"], desired_resolution=c["resolution"],
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        pdf_path = generate_complaint_pdf(
            doc_id=record.id, complaint_type=c["type"], applicant_name="Ramesh Kumar",
            applicant_address="123 Model Town, Delhi", applicant_contact="9876543210",
            recipient_name=c["recipient"], recipient_address="",
            subject=content["subject"], opening_paragraph=content["opening_paragraph"],
            body_paragraphs=content["body_paragraphs"],
            desired_resolution_paragraph=content["desired_resolution_paragraph"],
            closing_paragraph=content["closing_paragraph"], relevant_law_reference=content["relevant_law_reference"],
        )
        record.pdf_path = pdf_path
        db.commit()

    elig_samples = [
        {"age": 22, "gender": "female", "state": "Punjab", "income": 150000, "occupation": "student", "student_status": "yes"},
        {"age": 45, "gender": "male", "state": "Delhi", "income": 200000, "occupation": "farmer", "student_status": "no"},
    ]
    for e in elig_samples:
        db.add(EligibilityHistory(user_id=demo_user.id, eligible_scheme_ids="pmjay,pmuy", **e))
    db.commit()

    session_id = str(uuid.uuid4())
    db.add(ChatMessage(session_id=session_id, role="user", message="My employer hasn't paid my salary for 2 months", language="en"))
    db.add(ChatMessage(session_id=session_id, role="assistant", message="Your employer is legally required to pay your wages on time...", language="en"))
    db.commit()

    return {"status": "seeded", "message": "Demo data seeded successfully."}