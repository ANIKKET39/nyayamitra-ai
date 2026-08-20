# NyayaMitra AI

**Know your rights. Generate documents. Take action.**

Built for **OOSC 4.0 — Problem Statement 3: AI for Civic and Legal Empowerment**.

NyayaMitra AI is a full-stack web platform that helps Indian citizens understand
their legal rights, navigate government procedures, generate RTI applications,
check government scheme eligibility, and create complaint letters — all in
simple, multilingual language.

---

## ✨ Features

| Module | Description |
|---|---|
| **Rights Navigator** | Conversational AI (English/Hindi/Punjabi) that explains applicable rights, responsible authority, required documents, timeline, and next steps for any civic/legal issue. |
| **RTI Draft Generator** | 3-step wizard that generates a legally formatted RTI application under Section 6(1) of the RTI Act, 2005, and produces a downloadable PDF. |
| **Scheme Eligibility Checker** | Conversational eligibility interview matched against a real dataset of central government schemes, with personalized reasoning. |
| **Complaint Letter Generator** | Generates professional complaint letters for consumer, landlord/security deposit, workplace grievance, and municipal complaints — downloadable as PDF. |
| **Dashboard** | Visual overview (Recharts) of all documents generated, with quick re-download access. |

---

## 🏗️ Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + React Router + Recharts + Lucide Icons
- **Backend:** FastAPI (Python 3.11+)
- **Database:** SQLite + SQLAlchemy ORM
- **PDF Generation:** ReportLab
- **AI:** Anthropic Claude API (optional — see below) with a deterministic rule-based fallback engine

> **Important — works with or without an API key.** Every AI feature is wired
> through `backend/services/ai_client.py`. If `ANTHROPIC_API_KEY` is set in
> the environment, it calls the live Claude API using the dedicated prompt
> template for that feature. If no key is set (or the call fails for any
> reason), it automatically falls back to a rule-based reasoning engine so
> the **entire product works offline, out of the box** — ideal for hackathon
> judging environments with no internet or API budget.

---

## 📁 Project Structure

```
nyayamitra-ai/
├── backend/
│   ├── main.py                     # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── seed_demo_data.py           # Populates DB with demo data
│   ├── routes/                     # REST API endpoints (thin controllers)
│   │   ├── rights.py
│   │   ├── rti.py
│   │   ├── schemes.py
│   │   ├── complaints.py
│   │   └── dashboard.py
│   ├── services/                   # Business logic (separated from routes)
│   │   ├── ai_client.py            # LLM call wrapper + fallback logic
│   │   ├── rights_service.py
│   │   ├── rti_service.py
│   │   ├── scheme_service.py
│   │   ├── complaint_service.py
│   │   └── pdf_service.py          # ReportLab PDF generation
│   ├── prompts/                    # One prompt template per AI feature
│   │   ├── rights_prompt.py
│   │   ├── rti_prompt.py
│   │   ├── scheme_prompt.py
│   │   └── complaint_prompt.py
│   ├── database/
│   │   ├── db.py                   # SQLAlchemy engine/session setup
│   │   └── models.py                # User, RTIDocument, Complaint, EligibilityHistory, ChatMessage
│   ├── data/
│   │   └── schemes.json            # Sample government schemes dataset
│   └── generated_pdfs/             # Output directory for generated PDFs
│
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Landing, Chat, RTIGenerator, SchemeChecker, ComplaintGenerator, Dashboard
│   │   ├── components/             # Navbar, Footer, shared UI primitives
│   │   ├── api/client.js           # Centralized API client (axios)
│   │   └── index.css               # Tailwind + design tokens
│   ├── tailwind.config.js
│   └── package.json
│
├── DIAGRAMS.md                     # Mermaid architecture + user-flow diagrams
├── PITCH_DECK_CONTENT.md           # 7-slide hackathon pitch content
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Optional: enable live AI responses (otherwise rule-based fallback is used automatically)
export ANTHROPIC_API_KEY=sk-ant-...   # Windows: set ANTHROPIC_API_KEY=sk-ant-...

# Optional but recommended: populate the dashboard with demo data
python seed_demo_data.py

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure backend URL (defaults to http://localhost:8000 if omitted)
cp .env.example .env

npm run dev
```

The app will be live at `http://localhost:5173`.

### 3. Open the app

Visit `http://localhost:5173` in your browser. Try:
- **Rights Navigator:** "My landlord is not returning my security deposit"
- **RTI Generator:** Department: "Municipal Corporation of Delhi", Issue: "delay in issuing birth certificate"
- **Scheme Checker:** Age 22, Female, Punjab, Income ₹1,50,000, Student
- **Complaint Generator:** Consumer complaint about a defective product

---

## 🔌 API Reference (summary)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rights/ask` | Ask a rights/legal question |
| GET | `/api/rights/history/{session_id}` | Retrieve chat history |
| POST | `/api/rti/generate` | Generate an RTI application + PDF |
| GET | `/api/rti/{id}/download` | Download RTI PDF |
| GET | `/api/rti/list` | List generated RTI applications |
| POST | `/api/schemes/check` | Check scheme eligibility |
| GET | `/api/schemes/all` | List all schemes |
| POST | `/api/complaints/generate` | Generate a complaint letter + PDF |
| GET | `/api/complaints/{id}/download` | Download complaint PDF |
| GET | `/api/complaints/list` | List generated complaints |
| GET | `/api/dashboard/summary` | Aggregated stats for the dashboard |

Full interactive documentation is auto-generated by FastAPI at `/docs`.

---

## 🤖 AI Design

Each AI-powered feature has its **own isolated prompt template** (no single
giant prompt), located in `backend/prompts/`:

- `rights_prompt.py` — legal rights reasoning, returns structured JSON (rights, authority, documents, timeline, next steps)
- `rti_prompt.py` — RTI application drafting (subject, numbered information requests, grounds, fee note)
- `scheme_prompt.py` — personalized "why you're eligible" explanations layered on top of a deterministic rules engine
- `complaint_prompt.py` — complaint letter drafting, tone/law-reference adapted per complaint type

All four are called through the shared `services/ai_client.py`, which handles
live API calls and fallback logic uniformly.

---

## 🗄️ Database Schema

- **users** — basic profile (name, email, phone, state)
- **rti_documents** — every RTI application generated, linked to PDF path
- **complaints** — every complaint letter generated, linked to PDF path
- **eligibility_history** — every scheme-eligibility check performed
- **chat_messages** — Rights Navigator conversation log, grouped by session

All models are defined with SQLAlchemy in `backend/database/models.py`.

---

## 📊 Demo Data

Run `python backend/seed_demo_data.py` after setup to populate the database
with realistic sample RTI applications, complaint letters, and eligibility
checks — so the Dashboard looks populated immediately for a live demo or
judging walkthrough.

---

## 🔮 Future Scope

See `PITCH_DECK_CONTENT.md` (Slide 7) for the full roadmap, including voice
interfaces, WhatsApp integration, state-level scheme expansion, DigiLocker
integration, and a lawyer/NGO escalation marketplace.

---

## ⚖️ Disclaimer

NyayaMitra AI provides general legal information and drafting assistance for
educational and civic-empowerment purposes. It is **not a substitute for
advice from a licensed lawyer**. Every generated document includes this
disclaimer.
