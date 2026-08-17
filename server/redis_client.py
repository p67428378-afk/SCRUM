import os
import time
from typing import Optional


class InMemoryRedis:
    def __init__(self):
        self.store = {}
        self.expires = {}

    def get(self, key: str) -> Optional[str]:
        self._cleanup()
        if key in self.store:
            return self.store[key]
        return None

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self.store[key] = value
        if ex:
            self.expires[key] = time.time() + ex
        else:
            self.expires.pop(key, None)
        return True

    def delete(self, key: str) -> bool:
        self.store.pop(key, None)
        self.expires.pop(key, None)
        return True

    def _cleanup(self):
        now = time.time()
        expired_keys = [k for k, t in self.expires.items() if t < now]
        for k in expired_keys:
            self.store.pop(k, None)
            self.expires.pop(k, None)


# Try to initialize real Redis if REDIS_URL is provided, otherwise fallback to InMemoryRedis
redis_client = None
redis_url = os.getenv("REDIS_URL")

if redis_url:
    try:
        import redis

        redis_client = redis.from_url(redis_url, decode_responses=True)
    except ImportError:
        print("redis-py not installed, falling back to InMemoryRedis")
        redis_client = InMemoryRedis()
else:
    redis_client = InMemoryRedis()


def get_redis():
    return redis_client
