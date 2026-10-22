# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

## Current Status: Phase 4 – Execution Control ✅

Full end-to-end flow:

1. Register / Login  
2. Create project & configure objective  
3. Run multi-agent research  
4. Explore opportunities & scenarios  
5. **Approve or reject** the recommended strategy  
6. **Authorize & execute** individual actions (backend-enforced)  
7. **Track outcomes** and view auditable report  

## Quick Start

```bash
docker-compose up -d db
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload --port 8000

cd frontend && npm install && npm run dev
```

- App → http://localhost:5173  
- API → http://localhost:8000/docs  

## Phase 4 Features

| Component | Status |
|-----------|--------|
| Approval model & API | ✅ |
| Execution actions + backend auth gates | ✅ |
| Risk-limit checks on action creation | ✅ |
| Authorize → Execute flow | ✅ |
| Outcome tracking | ✅ |
| Reporting agent (no invented numbers) | ✅ |
| Approval / Execution / Report UIs | ✅ |

## Security (from master prompt)

1. Persist workflow state in PostgreSQL  
2. Separate AI reasoning from money math  
3. Enforce approvals in FastAPI — every sensitive action checked server-side  

## Next: Phase 5

Dashboard charts · mobile polish · tests · deployment notes  

Full spec: [MASTER_DEVELOPMENT_PROMPT.md](./MASTER_DEVELOPMENT_PROMPT.md)
