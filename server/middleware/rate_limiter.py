from fastapi import HTTPException
from typing import Dict
import time


class RateLimiter:
    def __init__(self):
        # In-memory window tracking: (tenant_id) -> list of timestamps
        self.requests: Dict[str, list] = {}

    def check_rate_limit(self, tenant_id: str, limit_rpm: int):
        now = time.time()
        window_start = now - 60.0

        if tenant_id not in self.requests:
            self.requests[tenant_id] = []

        # Filter timestamps within the last 60 seconds
        self.requests[tenant_id] = [
            t for t in self.requests[tenant_id] if t > window_start
        ]

        if len(self.requests[tenant_id]) >= limit_rpm:
            raise HTTPException(
                status_code=429, detail="Rate limit exceeded. Too many requests."
            )

        self.requests[tenant_id].append(now)


rate_limiter = RateLimiter()
