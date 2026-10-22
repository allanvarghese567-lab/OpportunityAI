# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

Multi-agent business opportunity platform — **React + TypeScript + FastAPI + Python + LangGraph**.

## Current Status: Phase 1 – Foundation ✅

You can already:

1. Register / Login
2. Create projects
3. Run the full multi-step Configuration Wizard
4. Confirm configuration (immutable snapshot)
5. View project details

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ (or just use Docker)

### 1. Start the database (Docker)
```bash
docker-compose up -d db
```

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env if needed

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API docs → http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App → http://localhost:5173

## What was built in Phase 1

- [x] Monorepo structure
- [x] FastAPI backend with JWT auth
- [x] SQLAlchemy models: User, Project, Configuration
- [x] Project CRUD + Configuration versioning + Confirm endpoint
- [x] React frontend (Vite + TypeScript + Tailwind)
- [x] Login / Register
- [x] Dashboard with project cards
- [x] Full 7-step Configuration Wizard
- [x] Project detail view

## Next: Phase 2

- LangGraph multi-agent workflow
- Market Researcher agent
- SSE live progress streaming
- Research Workspace UI

Full specification: [MASTER_DEVELOPMENT_PROMPT.md](./MASTER_DEVELOPMENT_PROMPT.md)
