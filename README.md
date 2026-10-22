# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

Multi-agent business opportunity platform — **React + TypeScript + FastAPI + Python**.

## Status: Phase 5 – Production Ready ✅

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation (auth, projects, config wizard) | ✅ |
| 2 | Research Core (agents, SSE, mock adapter) | ✅ |
| 3 | Analysis (scenarios, explorer, detail tabs) | ✅ |
| 4 | Execution (approvals, actions, outcomes, reports) | ✅ |
| 5 | Polish (dashboard, mobile, tests, deployment) | ✅ |

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

## End-to-end flow

```
Dashboard (stats + status chart)
  → New Project (7-step config wizard)
  → Research Workspace → live agent SSE
  → Opportunity Explorer / Detail
  → Approve Strategy
  → Execution Control (authorize → execute)
  → Project Report
```

## Tests

```bash
cd backend && source .venv/bin/activate && pytest tests/ -v
```

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Security (master prompt)

1. Persist workflow state in PostgreSQL  
2. Separate AI reasoning from money math  
3. Enforce approvals and budget limits in FastAPI  

Full specification: [MASTER_DEVELOPMENT_PROMPT.md](./MASTER_DEVELOPMENT_PROMPT.md)
