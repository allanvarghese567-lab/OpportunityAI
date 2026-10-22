# OpportunityAI

**AI-Powered Opportunity Research & Execution Platform**

## Status: Phase 6 – Enterprise & Scaling ✅

| Phase | Scope | Status |
|-------|-------|--------|
| 1–5 | Foundation through polish | ✅ |
| 6 | Enterprise (orgs, RBAC, API keys, webhooks, audit, scaling) | ✅ |

## Quick Start

```bash
docker-compose up -d db
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Phase 6 features

- **Organizations** – multi-tenant with slug + plan
- **RBAC** – owner · admin · member · viewer
- **API Keys** – scoped `oai_…` keys
- **Webhooks** – HMAC-signed outbound events
- **Audit log** – immutable action trail
- **Rate limiting** – middleware (Redis path in SCALING.md)
- **Scaling docs** – horizontal API, SSE, capacity

## Docs

- [Deployment](./docs/DEPLOYMENT.md)
- [Scaling](./docs/SCALING.md)
- [Master prompt](./MASTER_DEVELOPMENT_PROMPT.md)
