"""Redis caching utilities."""

import json
import functools
from typing import Optional

import redis.asyncio as redis

from app.config import settings

redis_client: Optional[redis.Redis] = None


async def init_redis() -> redis.Redis:
    """Initialize and return the Redis client."""
    global redis_client
    redis_client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    return redis_client


async def close_redis():
    """Close the Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()


async def get_redis() -> redis.Redis:
    """Get the current Redis client instance."""
    global redis_client
    if redis_client is None:
        await init_redis()
    return redis_client


async def cache_get(key: str) -> Optional[str]:
    """Get a value from Redis cache."""
    try:
        r = await get_redis()
        return await r.get(key)
    except Exception:
        return None


async def cache_set(key: str, value: str, ttl: int = None):
    """Set a value in Redis cache with optional TTL."""
    try:
        r = await get_redis()
        if ttl is None:
            ttl = settings.CACHE_TTL
        await r.set(key, value, ex=ttl)
    except Exception:
        pass


async def cache_delete(pattern: str):
    """Delete cache keys matching a pattern."""
    try:
        r = await get_redis()
        keys = []
        async for key in r.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await r.delete(*keys)
    except Exception:
        pass


async def cache_invalidate_prefix(prefix: str):
    """Invalidate all cache keys with a given prefix."""
    await cache_delete(f"{prefix}:*")


def cached(prefix: str, ttl: int = None):
    """Decorator to cache the JSON response of an async function.
    
    Usage:
        @cached("profile", ttl=600)
        async def get_profile(db):
            ...
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key from prefix and args
            cache_key = f"{prefix}:{func.__name__}"
            
            # Try cache first
            cached_value = await cache_get(cache_key)
            if cached_value is not None:
                return json.loads(cached_value)
            
            # Call function
            result = await func(*args, **kwargs)
            
            # Store in cache
            if result is not None:
                await cache_set(cache_key, json.dumps(result, default=str), ttl)
            
            return result
        return wrapper
    return decorator
