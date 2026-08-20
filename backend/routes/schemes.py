"""
API routes for the Government Scheme Eligibility Checker module.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import EligibilityHistory
from services.scheme_service import check_eligibility, get_all_schemes

router = APIRouter(prefix="/api/schemes", tags=["Scheme Eligibility"])


class EligibilityRequest(BaseModel):
    age: int | None = None
    gender: str | None = None
    state: str | None = None
    income: int | None = None
    occupation: str | None = None
    student_status: str | None = None
    user_id: str | None = None


@router.post("/check")
def check(payload: EligibilityRequest, db: Session = Depends(get_db)):
    profile = payload.dict(exclude={"user_id"})
    result = check_eligibility(profile)

    history = EligibilityHistory(
        user_id=payload.user_id,
        age=payload.age,
        gender=payload.gender,
        state=payload.state,
        income=payload.income,
        occupation=payload.occupation,
        student_status=payload.student_status,
        eligible_scheme_ids=",".join(s["id"] for s in result["matched_schemes"]),
    )
    db.add(history)
    db.commit()

    return result


@router.get("/all")
def all_schemes():
    return get_all_schemes()


@router.get("/history")
def history(user_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(EligibilityHistory)
    if user_id:
        q = q.filter(EligibilityHistory.user_id == user_id)
    records = q.order_by(EligibilityHistory.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "age": r.age,
            "gender": r.gender,
            "state": r.state,
            "income": r.income,
            "occupation": r.occupation,
            "eligible_scheme_ids": (r.eligible_scheme_ids or "").split(",") if r.eligible_scheme_ids else [],
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
