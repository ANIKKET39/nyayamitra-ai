"""
API routes for the RTI Draft Generator module.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import RTIDocument
from services.rti_service import generate_rti_content
from services.pdf_service import generate_rti_pdf

router = APIRouter(prefix="/api/rti", tags=["RTI Generator"])


class RTIRequest(BaseModel):
    department: str
    issue: str
    location: str
    applicant_name: str
    applicant_address: str
    applicant_contact: str | None = None
    user_id: str | None = None


@router.post("/generate")
def generate_rti(payload: RTIRequest, db: Session = Depends(get_db)):
    content = generate_rti_content(payload.department, payload.issue, payload.location)

    record = RTIDocument(
        user_id=payload.user_id,
        department=payload.department,
        issue=payload.issue,
        location=payload.location,
        applicant_name=payload.applicant_name,
        applicant_address=payload.applicant_address,
        applicant_contact=payload.applicant_contact,
        subject=content["subject"],
        information_requested="\n".join(content["information_requested"]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    pdf_path = generate_rti_pdf(
        doc_id=record.id,
        applicant_name=payload.applicant_name,
        applicant_address=payload.applicant_address,
        applicant_contact=payload.applicant_contact or "",
        department=payload.department,
        location=payload.location,
        subject=content["subject"],
        information_requested=content["information_requested"],
        grounds=content.get("grounds", ""),
        fee_note=content.get("fee_note", ""),
    )
    record.pdf_path = pdf_path
    db.commit()

    return {
        "id": record.id,
        "content": content,
        "pdf_download_url": f"/api/rti/{record.id}/download",
    }


@router.get("/{doc_id}/download")
def download_rti(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(RTIDocument).filter(RTIDocument.id == doc_id).first()
    if not record or not record.pdf_path:
        raise HTTPException(status_code=404, detail="RTI document not found")
    return FileResponse(record.pdf_path, media_type="application/pdf", filename=f"RTI_Application_{doc_id[:8]}.pdf")


@router.get("/list")
def list_rti(user_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(RTIDocument)
    if user_id:
        q = q.filter(RTIDocument.user_id == user_id)
    records = q.order_by(RTIDocument.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "department": r.department,
            "issue": r.issue,
            "location": r.location,
            "subject": r.subject,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
