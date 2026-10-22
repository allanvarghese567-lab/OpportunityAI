# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

Multi-agent business opportunity platform — **React + TypeScript + FastAPI + Python**.

## Current Status: Phase 2 – Research Core ✅

You can now:

1. Register / Login  
2. Create projects & configure objectives  
3. **Start a live multi-agent research run**  
4. Watch agents work in real time (SSE stream)  
5. Inspect discovered opportunities + financial scenarios  
6. See the ranked recommendation  

## Quick Start

```bash
# Database
docker-compose up -d db

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- App → http://localhost:5173  
- API docs → http://localhost:8000/docs  

## Phase 2 Features

| Component | Status |
|-----------|--------|
| Pure financial calculation functions | ✅ |
| Pluggable research adapter interface | ✅ |
| Mock local-market adapter | ✅ |
| Multi-agent workflow | ✅ |
| SSE live progress streaming | ✅ |
| Research Workspace UI | ✅ |
| Opportunity cards + verification status | ✅ |
| Ranked strategy recommendation | ✅ |

### Agents in the pipeline

1. **Configuration Validator** – checks constraints  
2. **Market Researcher** – finds candidates via adapters  
3. **Financial Analyst** – pure-Python profit & scenario math  
4. **Risk & Evidence Validator** – VERIFIED / PARTIALLY_VERIFIED / UNVERIFIED / REJECTED  
5. **Executor** – ranks and recommends the best strategy  

## Next: Phase 3

- Scenario Planner agent  
- Full Opportunity Detail & Scenario Explorer  
- Side-by-side comparison  

Full specification: [MASTER_DEVELOPMENT_PROMPT.md](./MASTER_DEVELOPMENT_PROMPT.md)
