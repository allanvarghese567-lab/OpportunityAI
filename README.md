# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

Multi-agent business opportunity platform — **React + TypeScript + FastAPI + Python**.

## Current Status: Phase 3 – Analysis & Validation ✅

You can now:

1. Register / Login  
2. Create projects & configure objectives  
3. Run live multi-agent research  
4. **Explore opportunities** (filter, sort, cards/table)  
5. **Open opportunity detail** with tabs: Overview · Financial · Scenarios · Risk · Evidence  
6. See scenario trees + recovery alternatives  
7. Get a ranked recommendation  

## Quick Start

```bash
docker-compose up -d db

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

cd frontend
npm install && npm run dev
```

- App → http://localhost:5173  
- API docs → http://localhost:8000/docs  

## Phase 3 Features

| Component | Status |
|-----------|--------|
| Scenario Planner agent | ✅ |
| Scenario trees + recovery alternatives | ✅ |
| Opportunity Explorer (search, filter, sort, cards/table) | ✅ |
| Opportunity Detail (5 tabs) | ✅ |
| Financial analysis panel | ✅ |
| Risk & evidence panels | ✅ |

### Agents

1. Configuration Validator  
2. Market Researcher  
3. Financial Analyst  
4. **Scenario Planner**  
5. Risk & Evidence Validator  
6. Executor / Strategy Selector  

## User flow

```
Dashboard → New Project → Config Wizard → Confirm
       → Project Detail → Research Workspace → Start Research
       → Opportunity Explorer → Opportunity Detail (tabs)
```

## Next: Phase 4

- Approval flows  
- Execution action authorization  
- Outcome tracking  
- Reporting agent  

Full specification: [MASTER_DEVELOPMENT_PROMPT.md](./MASTER_DEVELOPMENT_PROMPT.md)
