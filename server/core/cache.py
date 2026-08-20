import json
import logging
from typing import Any, Optional
from server.core.config import settings

logger = logging.getLogger(__name__)

# Fallback in-memory cache storage
_memory_cache = {}

# Try initializing redis client if available
_redis_client = None
try:
    import redis

    _redis_client = redis.Redis.from_url(
        settings.REDIS_URL, decode_responses=True, socket_timeout=1.0
    )
    # Test ping
    _redis_client.ping()
except Exception as e:
    logger.info(f"Redis cache unavailable, falling back to in-memory cache: {e}")
    _redis_client = None


def get_cache(key: str) -> Optional[Any]:
    """Retrieve item from Redis cache or in-memory fallback."""
    if _redis_client:
        try:
            val = _redis_client.get(key)
            if val is not None:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Redis get failed for key {key}: {e}")

    # Fallback to in-memory
    if key in _memory_cache:
        return _memory_cache[key]
    return None


def set_cache(key: str, value: Any, ttl: int = 86400) -> bool:
    """Store item in Redis cache or in-memory fallback."""
    try:
        json_val = json.dumps(value)
    except Exception as e:
        logger.error(f"Failed to serialize value for key {key}: {e}")
        return False

    if _redis_client:
        try:
            _redis_client.setex(key, ttl, json_val)
            return True
        except Exception as e:
            logger.warning(f"Redis set failed for key {key}: {e}")

    # Fallback to in-memory
    _memory_cache[key] = json.loads(json_val)
    return True


def clear_cache() -> None:
    """Clear both Redis and in-memory caches."""
    global _memory_cache
    _memory_cache.clear()
    if _redis_client:
        try:
            _redis_client.flushdb()
        except Exception as e:
            logger.warning(f"Redis flush failed: {e}")
