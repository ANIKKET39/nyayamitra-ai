"""
API routes for the Complaint Letter Generator module.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import Complaint
from services.complaint_service import generate_complaint_content
from services.pdf_service import generate_complaint_pdf

router = APIRouter(prefix="/api/complaints", tags=["Complaint Generator"])

VALID_TYPES = {"consumer", "landlord", "workplace", "municipal"}


class ComplaintRequest(BaseModel):
    complaint_type: str          # consumer | landlord | workplace | municipal
    subject_hint: str
    description: str
    desired_resolution: str | None = None
    applicant_name: str
    applicant_address: str
    applicant_contact: str | None = None
    recipient_name: str
    recipient_address: str | None = None
    user_id: str | None = None


@router.post("/generate")
def generate_complaint(payload: ComplaintRequest, db: Session = Depends(get_db)):
    if payload.complaint_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"complaint_type must be one of {VALID_TYPES}")

    details = {
        "subject_hint": payload.subject_hint,
        "description": payload.description,
        "desired_resolution": payload.desired_resolution,
    }
    content = generate_complaint_content(payload.complaint_type, details)

    record = Complaint(
        user_id=payload.user_id,
        complaint_type=payload.complaint_type,
        recipient_name=payload.recipient_name,
        recipient_address=payload.recipient_address,
        applicant_name=payload.applicant_name,
        applicant_address=payload.applicant_address,
        applicant_contact=payload.applicant_contact,
        subject=content["subject"],
        details=payload.description,
        desired_resolution=payload.desired_resolution,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    pdf_path = generate_complaint_pdf(
        doc_id=record.id,
        complaint_type=payload.complaint_type,
        applicant_name=payload.applicant_name,
        applicant_address=payload.applicant_address,
        applicant_contact=payload.applicant_contact or "",
        recipient_name=payload.recipient_name,
        recipient_address=payload.recipient_address or "",
        subject=content["subject"],
        opening_paragraph=content["opening_paragraph"],
        body_paragraphs=content["body_paragraphs"],
        desired_resolution_paragraph=content["desired_resolution_paragraph"],
        closing_paragraph=content["closing_paragraph"],
        relevant_law_reference=content["relevant_law_reference"],
    )
    record.pdf_path = pdf_path
    db.commit()

    return {
        "id": record.id,
        "content": content,
        "pdf_download_url": f"/api/complaints/{record.id}/download",
    }


@router.get("/{doc_id}/download")
def download_complaint(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(Complaint).filter(Complaint.id == doc_id).first()
    if not record or not record.pdf_path:
        raise HTTPException(status_code=404, detail="Complaint letter not found")
    return FileResponse(record.pdf_path, media_type="application/pdf", filename=f"Complaint_{doc_id[:8]}.pdf")


@router.get("/list")
def list_complaints(user_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Complaint)
    if user_id:
        q = q.filter(Complaint.user_id == user_id)
    records = q.order_by(Complaint.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "complaint_type": r.complaint_type,
            "subject": r.subject,
            "recipient_name": r.recipient_name,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
