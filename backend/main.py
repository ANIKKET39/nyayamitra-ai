"""
NyayaMitra AI — FastAPI backend entrypoint.

Run with:
    uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine, Base
from routes import rights, rti, schemes, complaints, dashboard

# Create all tables on startup (SQLite — zero config)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NyayaMitra AI API",
    description="AI for Civic and Legal Empowerment — Rights Navigator, RTI Generator, "
                "Scheme Eligibility Checker, and Complaint Letter Generator.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relaxed for hackathon demo; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rights.router)
app.include_router(rti.router)
app.include_router(schemes.router)
app.include_router(complaints.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "message": "NyayaMitra AI API is running",
        "docs": "/docs",
        "modules": ["rights", "rti", "schemes", "complaints", "dashboard"],
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
