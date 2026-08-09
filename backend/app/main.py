"""FastAPI application factory and operational health endpoints."""

import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

import app.models  # noqa: F401 - register ORM models for migrations
from app.api.v1 import (
    alerts,
    approvals,
    audit,
    auth,
    chat,
    deployments,
    incidents,
    infrastructure,
    mcp_registry,
    monitoring,
    repositories,
)
from app.core.config import settings
from app.core.database import engine
from app.core.redis import redis_client
from app.middleware.telemetry import setup_telemetry


def configure_logging() -> None:
    """Configure human-readable development and JSON production logging."""

    logger.remove()
    log_directory = Path("logs")
    log_directory.mkdir(exist_ok=True)

    if settings.is_production:
        logger.add(sys.stdout, level=settings.LOG_LEVEL, serialize=True)
    else:
        logger.add(
            sys.stdout,
            level=settings.LOG_LEVEL,
            colorize=True,
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | {message}"
            ),
        )

    logger.add(
        log_directory / "devpilot.log",
        level="INFO",
        rotation="100 MB",
        retention="30 days",
        compression="gz",
        serialize=True,
    )


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Start optional services without blocking application availability."""

    configure_logging()
    redis_connected = await redis_client.connect()

    if settings.REDIS_ENABLED and not redis_connected:
        logger.warning("Redis is enabled but unavailable: {}", redis_client.status)

    logger.info(
        "{} started (environment={}, database_configured={}, redis={})",
        settings.APP_NAME,
        settings.ENVIRONMENT,
        engine is not None,
        redis_client.status,
    )

    try:
        yield
    finally:
        if engine is not None:
            await engine.dispose()
        await redis_client.close()
        logger.info("{} stopped", settings.APP_NAME)


def create_app() -> FastAPI:
    """Create the DevPilot API without performing infrastructure mutations."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="DevPilot AI backend foundation.",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    if settings.is_production:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

    setup_telemetry(app)

    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        should_respect_env_var=True,
        env_var_name="ENABLE_METRICS",
        excluded_handlers=["/health", "/ready", "/metrics"],
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

    prefix = settings.API_V1_PREFIX
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["auth"])
    app.include_router(chat.router, prefix=f"{prefix}/chat", tags=["chat"])
    app.include_router(repositories.router, prefix=f"{prefix}/repositories", tags=["repositories"])
    app.include_router(deployments.router, prefix=f"{prefix}/deployments", tags=["deployments"])
    app.include_router(
        infrastructure.router,
        prefix=f"{prefix}/infrastructure",
        tags=["infrastructure"],
    )
    app.include_router(monitoring.router, prefix=f"{prefix}/monitoring", tags=["monitoring"])
    app.include_router(alerts.router, prefix=f"{prefix}/alerts", tags=["alerts"])
    app.include_router(incidents.router, prefix=f"{prefix}/incidents", tags=["incidents"])
    app.include_router(audit.router, prefix=f"{prefix}/audit", tags=["audit"])
    app.include_router(approvals.router, prefix=f"{prefix}/approvals", tags=["approvals"])
    app.include_router(mcp_registry.router, prefix=f"{prefix}/mcp", tags=["mcp"])

    @app.get("/health", include_in_schema=False)
    async def health_check() -> dict[str, str]:
        return {"status": "ok", "version": settings.APP_VERSION}

    @app.get("/ready", include_in_schema=False)
    async def readiness_check() -> JSONResponse:
        checks: dict[str, str] = {"redis": redis_client.status}
        ready = True

        if settings.REDIS_ENABLED and not await redis_client.ping():
            ready = False
            checks["redis"] = redis_client.status

        if engine is None:
            ready = False
            checks["database"] = "not_configured"
        else:
            try:
                async with engine.connect() as connection:
                    await connection.execute(text("SELECT 1"))
                checks["database"] = "ok"
            except Exception as error:
                ready = False
                checks["database"] = f"unavailable: {error.__class__.__name__}"

        return JSONResponse(
            content={"status": "ready" if ready else "not_ready", "checks": checks},
            status_code=status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, error: Exception) -> JSONResponse:
        logger.exception("Unhandled application error: {}", error)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred."},
        )

    return app


# Apply CORS outside the FastAPI application so even responses generated by the
# server-level exception handler include the browser-required CORS headers.
app = CORSMiddleware(
    app=create_app(),
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
)
