# ARTHA AI — Voice (Ara)

ARTHA uses **Ara**, a Grok / xAI voice: warm, friendly, human-centered.

## Setup

1. Get an API key at https://console.x.ai
2. In `backend/.env`:

```env
XAI_API_KEY=xai-your-key-here
```

3. Restart the API server

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/voice/status` | Whether voice is enabled + allowed voices |
| `POST /api/v1/voice/speak` | `{ "text": "...", "voice_id": "ara" }` → MP3 |

Default voice is **ara**.

## UI

- Research Workspace — Speak recommendation
- Project Report — Speak report summary

## Brand sample

> Welcome to ARTHA AI. Economic intelligence. Opportunity. Wealth creation.
