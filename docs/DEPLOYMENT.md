# OpportunityAI – Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ / Python 3.12+

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://opportunity:opportunity@db:5432/opportunityai
SECRET_KEY=<generate-a-long-random-string>
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=["http://localhost:5173","https://your-domain.com"]
PROJECT_NAME=OpportunityAI
API_V1_STR=/api/v1
```

Generate a secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Production Docker Compose

See the full `docker-compose.prod.yml` example, Dockerfiles, and nginx SSE proxy config in this document on the repo.

Key points:

- PostgreSQL 16 with healthcheck
- Backend: uvicorn on port 8000
- Frontend: nginx serving static build + proxy `/api/` to backend
- `proxy_buffering off` required for SSE streams

## Running tests

```bash
cd backend
source .venv/bin/activate
pip install pytest
pytest tests/ -v
```

## Security checklist

- [ ] Strong unique `SECRET_KEY`
- [ ] HTTPS via reverse proxy
- [ ] Restrict CORS to real domain
- [ ] Database not exposed publicly
- [ ] Rate limiting on auth endpoints (recommended)
- [ ] Regular PostgreSQL backups
- [ ] No secrets committed to git

## Local development

```bash
docker-compose up -d db
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

App: http://localhost:5173 · API: http://localhost:8000/docs
