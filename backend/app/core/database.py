"""SQLAlchemy async database lifecycle and request-session dependency."""

from collections.abc import AsyncGenerator

from fastapi import HTTPException, status
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for DevPilot ORM models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


engine: AsyncEngine | None = (
    create_async_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
    )
    if settings.DATABASE_URL
    else None
)

session_factory: async_sessionmaker[AsyncSession] | None = (
    async_sessionmaker(engine, expire_on_commit=False) if engine else None
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session or return a clear configuration error."""

    if session_factory is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Set DATABASE_URL and run migrations.",
        )

    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
