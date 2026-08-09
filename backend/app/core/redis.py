"""Optional Redis lifecycle management."""

from redis.asyncio import Redis, from_url

from app.core.config import settings


class RedisManager:
    """Connect to Redis only when explicitly enabled."""

    def __init__(self) -> None:
        self._client: Redis | None = None
        self._connection_error: str | None = None

    @property
    def enabled(self) -> bool:
        return settings.REDIS_ENABLED

    @property
    def status(self) -> str:
        if not self.enabled:
            return "disabled"
        if self._client is not None:
            return "ok"
        return self._connection_error or "unavailable"

    async def connect(self) -> bool:
        if not self.enabled:
            return False
        if not settings.REDIS_URL:
            self._connection_error = "REDIS_URL is required when REDIS_ENABLED=true"
            return False

        client = from_url(settings.REDIS_URL, decode_responses=True)
        try:
            await client.ping()
        except Exception as error:
            self._connection_error = str(error)
            await client.aclose()
            return False

        self._client = client
        self._connection_error = None
        return True

    async def ping(self) -> bool:
        if self._client is None:
            return False
        try:
            return bool(await self._client.ping())
        except Exception as error:
            self._connection_error = str(error)
            return False

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None


redis_client = RedisManager()
