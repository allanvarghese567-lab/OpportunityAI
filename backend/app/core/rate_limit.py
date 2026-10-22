"""Simple in-memory rate limiter middleware for enterprise hardening.

For production at scale, replace with Redis-backed sliding window
(see docs/SCALING.md).
"""

import time
from collections import defaultdict
from typing import Callable, Dict, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_limit: int = 120, auth_limit: int = 20, window: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.auth_limit = auth_limit
        self.window = window
        self._buckets: Dict[str, Tuple[float, int]] = defaultdict(lambda: (0.0, 0))

    def _limit_for(self, path: str) -> int:
        if "/auth/" in path:
            return self.auth_limit
        return self.default_limit

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        ip = request.client.host if request.client else "unknown"
        path = request.url.path
        limit = self._limit_for(path)
        now = time.time()

        start, count = self._buckets[ip]
        if now - start > self.window:
            start, count = now, 0

        count += 1
        self._buckets[ip] = (start, count)

        if count > limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again shortly."},
                headers={"Retry-After": str(self.window)},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - count))
        return response
