"""Webhook delivery – fire-and-forget HTTP callbacks for enterprise events."""

import hashlib
import hmac
import json
import logging
from typing import Any, Dict, List

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enterprise import WebhookSubscription

logger = logging.getLogger(__name__)


def sign_payload(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


async def dispatch_event(
    db: AsyncSession,
    organization_id: int,
    event: str,
    payload: Dict[str, Any],
) -> int:
    result = await db.execute(
        select(WebhookSubscription).where(
            WebhookSubscription.organization_id == organization_id,
            WebhookSubscription.is_active == True,  # noqa: E712
        )
    )
    subs: List[WebhookSubscription] = list(result.scalars().all())
    attempts = 0
    body_dict = {"event": event, "data": payload}
    body_bytes = json.dumps(body_dict, default=str).encode()

    async with httpx.AsyncClient(timeout=10.0) as client:
        for sub in subs:
            events = sub.events if isinstance(sub.events, list) else []
            if event not in events and "*" not in events:
                continue
            signature = sign_payload(sub.secret, body_bytes)
            try:
                await client.post(
                    sub.url,
                    content=body_bytes,
                    headers={
                        "Content-Type": "application/json",
                        "X-ArthaAI-Event": event,
                        "X-ArthaAI-Signature": signature,
                    },
                )
                attempts += 1
            except Exception as exc:
                logger.warning("Webhook delivery failed for %s: %s", sub.url, exc)
    return attempts
