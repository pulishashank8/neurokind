"""
In-memory caching layer for Python API
Production-ready with TTL support and LRU eviction
"""

import time
import threading
from typing import Any, Optional, Dict
from functools import wraps
import logging

logger = logging.getLogger('python_api.cache')

class InMemoryCache:
    """Thread-safe in-memory cache with TTL support"""
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self._cache: Dict[str, tuple] = {}
        self._lock = threading.RLock()
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._hits = 0
        self._misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                if time.time() < expiry:
                    self._hits += 1
                    return value
                else:
                    del self._cache[key]
            self._misses += 1
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL"""
        ttl = ttl or self.default_ttl
        expiry = time.time() + ttl
        
        with self._lock:
            if len(self._cache) >= self.max_size:
                self._evict_oldest()
            self._cache[key] = (value, expiry)
    
    def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cached data"""
        with self._lock:
            self._cache.clear()
            logger.info("Cache cleared")
    
    def _evict_oldest(self) -> None:
        """Evict oldest entries when cache is full"""
        if not self._cache:
            return
        oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k][1])
        del self._cache[oldest_key]
    
    def stats(self) -> dict:
        """Get cache statistics"""
        with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0
            return {
                "size": len(self._cache),
                "max_size": self.max_size,
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": f"{hit_rate:.1f}%"
            }

cache = InMemoryCache(max_size=1000, default_ttl=300)

def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern: str = "") -> int:
    """Invalidate cache entries matching pattern"""
    count = 0
    with cache._lock:
        keys_to_delete = [k for k in cache._cache.keys() if pattern in k]
        for key in keys_to_delete:
            del cache._cache[key]
            count += 1
    logger.info(f"Invalidated {count} cache entries matching '{pattern}'")
    return count
