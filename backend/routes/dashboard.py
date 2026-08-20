"""
API routes for the Dashboard module — aggregates recent documents and
simple usage stats for charts (Recharts) on the frontend.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.db import get_db
from database.models import RTIDocument, Complaint, EligibilityHistory, ChatMessage

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def summary(user_id: str | None = None, db: Session = Depends(get_db)):
    rti_q = db.query(RTIDocument)
    complaint_q = db.query(Complaint)
    elig_q = db.query(EligibilityHistory)

    if user_id:
        rti_q = rti_q.filter(RTIDocument.user_id == user_id)
        complaint_q = complaint_q.filter(Complaint.user_id == user_id)
        elig_q = elig_q.filter(EligibilityHistory.user_id == user_id)

    rti_count = rti_q.count()
    complaint_count = complaint_q.count()
    elig_count = elig_q.count()
    chat_sessions = db.query(func.count(func.distinct(ChatMessage.session_id))).scalar() or 0

    recent_rti = rti_q.order_by(RTIDocument.created_at.desc()).limit(5).all()
    recent_complaints = complaint_q.order_by(Complaint.created_at.desc()).limit(5).all()

    complaint_type_breakdown = (
        db.query(Complaint.complaint_type, func.count(Complaint.id))
        .group_by(Complaint.complaint_type)
        .all()
    )

    recent_documents = []
    for r in recent_rti:
        recent_documents.append({
            "id": r.id, "type": "RTI Application", "title": r.subject[:80],
            "created_at": r.created_at.isoformat(), "download_url": f"/api/rti/{r.id}/download",
        })
    for c in recent_complaints:
        recent_documents.append({
            "id": c.id, "type": f"{c.complaint_type.title()} Complaint", "title": c.subject[:80],
            "created_at": c.created_at.isoformat(), "download_url": f"/api/complaints/{c.id}/download",
        })
    recent_documents.sort(key=lambda d: d["created_at"], reverse=True)

    return {
        "stats": {
            "rti_generated": rti_count,
            "complaints_generated": complaint_count,
            "eligibility_checks": elig_count,
            "chat_sessions": chat_sessions,
        },
        "complaint_type_breakdown": [{"type": t.title(), "count": c} for t, c in complaint_type_breakdown],
        "recent_documents": recent_documents[:8],
    }
