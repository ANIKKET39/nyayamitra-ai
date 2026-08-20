"""
SQLAlchemy ORM models for NyayaMitra AI.

Tables:
- User                : basic profile info, optional login-less "session user"
- RTIDocument          : every RTI application generated, with PDF path
- Complaint            : every complaint letter generated, with PDF path
- EligibilityHistory   : every scheme-eligibility check performed
- ChatMessage          : Rights Navigator conversation log (for dashboard/history)
"""
import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True, unique=False)
    phone = Column(String, nullable=True)
    state = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    rti_documents = relationship("RTIDocument", back_populates="user")
    complaints = relationship("Complaint", back_populates="user")
    eligibility_checks = relationship("EligibilityHistory", back_populates="user")


class RTIDocument(Base):
    __tablename__ = "rti_documents"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    department = Column(String, nullable=False)
    issue = Column(Text, nullable=False)
    location = Column(String, nullable=False)

    applicant_name = Column(String, nullable=False)
    applicant_address = Column(Text, nullable=False)
    applicant_contact = Column(String, nullable=True)

    subject = Column(String, nullable=False)
    information_requested = Column(Text, nullable=False)

    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="rti_documents")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    complaint_type = Column(String, nullable=False)  # consumer, landlord, workplace, municipal
    recipient_name = Column(String, nullable=False)
    recipient_address = Column(Text, nullable=True)

    applicant_name = Column(String, nullable=False)
    applicant_address = Column(Text, nullable=False)
    applicant_contact = Column(String, nullable=True)

    subject = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    desired_resolution = Column(Text, nullable=True)

    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="complaints")


class EligibilityHistory(Base):
    __tablename__ = "eligibility_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    state = Column(String, nullable=True)
    income = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    student_status = Column(String, nullable=True)

    eligible_scheme_ids = Column(Text, nullable=True)  # comma-separated scheme ids
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="eligibility_checks")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    language = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
