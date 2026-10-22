# OpportunityAI – Scaling Guide

## Horizontal scaling

| Component | Strategy |
|-----------|----------|
| **API (FastAPI)** | Stateless – N replicas behind a load balancer |
| **PostgreSQL** | Primary + read replicas; PgBouncer pooling |
| **SSE streams** | Sticky sessions or Redis pub/sub fan-out |
| **Background jobs** | Celery / ARQ for webhooks & reports |
| **Rate limiting** | Redis sliding-window (replace in-memory middleware) |

## Recommended stack

```
Clients → CDN/WAF → Load Balancer → API replicas
                              ↓
                         PgBouncer → PostgreSQL
                              ↓
                           Redis (cache, queues, rate limits)
```

## SSE at scale

1. Sticky sessions during a research run
2. Redis pub/sub – workers publish; any API pod streams to clients
3. Dedicated stream service for EventSource only

## Capacity (rough)

| Plan | Concurrent research | API RPS |
|------|---------------------|--------|
| Free | 2 | 20 |
| Pro | 20 | 200 |
| Enterprise | 200+ | 2000+ |

## Observability

- Structured JSON logs
- Prometheus: latency, research duration, webhook success
- `GET /health` liveness
