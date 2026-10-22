# ARTHA AI

**Economic Intelligence. Opportunity. Wealth Creation.**

> Discover Value. Engineer Opportunity. Build Wealth.

An AI-powered opportunity discovery and execution platform that combines market intelligence, multi-agent analysis, financial modelling, risk validation, and human-approved execution to help people identify and evaluate opportunities—from micro-capital experiments to scalable businesses.

**Brand promise:** Make better-informed decisions about where opportunity exists and how to pursue it responsibly.

---

## Full form — ARTHA

| Letter | Meaning |
|--------|--------|
| **A** | **Advanced** — Advanced AI reasoning, automation, and multi-agent intelligence |
| **R** | **Research** — Market research, economic signals, emerging trends, and underserved opportunities |
| **T** | **Technology** — A scalable, global AI SaaS platform connecting specialized agents, tools, and data sources |
| **H** | **Human-Centered** — Human-approved decisions, transparent risks, and practical strategies for entrepreneurs and small investors |
| **A** | **Advancement** — Turning validated opportunities into measurable progress, business growth, and wealth creation |

*Note: “Artha” is a Sanskrit-derived word associated with wealth, value, and purpose. The expanded form above is a brand acronym, not a linguistic translation. Trademark and domain availability have not been verified.*

---

## How ARTHA AI maps to the product

- **Economic intelligence** — Market conditions, demand, pricing, emerging trends
- **Opportunity discovery** — Underserved markets, business gaps, resale and service ideas
- **Multi-agent AI** — Researcher, analyst, scenario planner, risk validator, strategy agents
- **Micro-capital growth** — Small starting capital, costs, and downside risk
- **Wealth creation** — Evidence-based strategies, real outcomes, learning loops

---

## Platform status

| Phase | Scope | Status |
|-------|-------|--------|
| 1–5 | Foundation through polish | ✅ |
| 6 | Enterprise (orgs, RBAC, API keys, webhooks, audit, scaling) | ✅ |

---

## Quick Start

```bash
docker-compose up -d db
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

- **App** → http://localhost:5173
- **API docs** → http://localhost:8000/docs

---

## End-to-end flow

```
Dashboard → New Project → Research Workspace → Opportunity Explorer
  → Approve Strategy → Execution Control → Project Report → Enterprise
```

---

## Security principles

1. Persist workflow state in PostgreSQL
2. Separate AI reasoning from money math
3. Enforce approvals and budget limits in FastAPI
4. RBAC on enterprise resources
5. Audit sensitive mutations
6. Rate-limit auth and general API traffic

---

## Documentation

- [Deployment](./docs/DEPLOYMENT.md)
- [Scaling](./docs/SCALING.md)
- [Master development prompt](./MASTER_DEVELOPMENT_PROMPT.md)

---

**ARTHA AI** — Economic Intelligence. Opportunity. Wealth Creation.
