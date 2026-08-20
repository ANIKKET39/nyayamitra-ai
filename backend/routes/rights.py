"""
API routes for the Rights Navigator (AI chat) module.
"""
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import ChatMessage
from services.rights_service import get_rights_guidance

router = APIRouter(prefix="/api/rights", tags=["Rights Navigator"])


class RightsQuery(BaseModel):
    query: str
    language: str = "en"          # 'en' | 'hi' | 'pa'
    session_id: str | None = None


@router.post("/ask")
def ask_rights(payload: RightsQuery, db: Session = Depends(get_db)):
    session_id = payload.session_id or str(uuid.uuid4())

    # Log user message
    db.add(ChatMessage(session_id=session_id, role="user", message=payload.query, language=payload.language))
    db.commit()

    guidance = get_rights_guidance(payload.query, payload.language)

    # Log assistant response (store the plain-language summary for readability)
    db.add(ChatMessage(
        session_id=session_id,
        role="assistant",
        message=guidance.get("plain_language_summary", ""),
        language=payload.language,
    ))
    db.commit()

    return {"session_id": session_id, "guidance": guidance}


@router.get("/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {"role": m.role, "message": m.message, "language": m.language, "created_at": m.created_at.isoformat()}
        for m in messages
    ]
