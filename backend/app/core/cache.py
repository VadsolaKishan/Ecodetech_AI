import time
from typing import Any, Optional, Dict, List
import threading

class SimpleTtlCache:
    def __init__(self, default_ttl_seconds: int = 90):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = default_ttl_seconds
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            if time.time() > entry["expires_at"]:
                del self._cache[key]
                return None
            return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None, tags: Optional[List[str]] = None) -> None:
        duration = ttl if ttl is not None else self._default_ttl
        with self._lock:
            self._cache[key] = {
                "value": value,
                "expires_at": time.time() + duration,
                "tags": tags or []
            }

    def invalidate(self, key: str) -> None:
        with self._lock:
            if key in self._cache:
                del self._cache[key]

    def invalidate_by_tag(self, tag: str) -> None:
        with self._lock:
            keys_to_delete = [
                k for k, v in self._cache.items()
                if tag in v.get("tags", []) or tag in k
            ]
            for k in keys_to_delete:
                del self._cache[k]

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

# Global singleton cache instance for server process
api_cache = SimpleTtlCache(default_ttl_seconds=90)
