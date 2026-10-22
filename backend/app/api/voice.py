"""Voice endpoints — speak with Ara (Grok / xAI TTS)."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser
from app.services import voice as voice_service

router = APIRouter(prefix="/voice", tags=["voice"])


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=15000)
    voice_id: str = Field(default="ara", description="Grok voice id (default: ara)")
    language: str = Field(default="en")


@router.get("/status")
async def get_voice_status(current_user: CurrentUser):
    return voice_service.voice_status()


@router.post("/speak")
async def speak(body: SpeakRequest, current_user: CurrentUser):
    try:
        audio = await voice_service.synthesize_speech(
            body.text,
            voice_id=body.voice_id,
            language=body.language,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Voice synthesis error: {exc}") from exc

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": 'inline; filename="artha-ara.mp3"',
            "X-Artha-Voice": body.voice_id or "ara",
        },
    )
