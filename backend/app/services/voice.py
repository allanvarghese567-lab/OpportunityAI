"""ARTHA AI voice — Grok / xAI text-to-speech (default voice: Ara)."""

from __future__ import annotations

import httpx

from app.core.config import settings

DEFAULT_VOICE = "ara"
ALLOWED_VOICES = frozenset(
    {
        "ara",
        "eve",
        "carina",
        "luna",
        "iris",
        "leo",
        "rex",
        "sal",
        "celeste",
        "liora",
        "ursa",
        "aurora",
    }
)

XAI_TTS_URL = "https://api.x.ai/v1/tts"


async def synthesize_speech(
    text: str,
    *,
    voice_id: str = DEFAULT_VOICE,
    language: str = "en",
) -> bytes:
    if not settings.XAI_API_KEY:
        raise RuntimeError(
            "XAI_API_KEY is not set. Add it to backend/.env to enable Ara voice."
        )

    voice = (voice_id or DEFAULT_VOICE).lower().strip()
    if voice not in ALLOWED_VOICES:
        voice = DEFAULT_VOICE

    payload = {
        "text": text[:15000],
        "voice_id": voice,
        "language": language or "en",
        "output_format": {
            "codec": "mp3",
            "sample_rate": 44100,
            "bit_rate": 128000,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            XAI_TTS_URL,
            headers={
                "Authorization": f"Bearer {settings.XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"xAI TTS failed ({resp.status_code}): {resp.text[:300]}")
        return resp.content


def voice_status() -> dict:
    return {
        "enabled": bool(settings.XAI_API_KEY),
        "default_voice": DEFAULT_VOICE,
        "default_voice_name": "Ara",
        "allowed_voices": sorted(ALLOWED_VOICES),
        "provider": "xAI Grok TTS",
    }
