"""User persistence model used by authentication and ownership features."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """A DevPilot account, optionally linked to a GitHub identity."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    is_superuser: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    github_id: Mapped[str | None] = mapped_column(String, unique=True, index=True)
    role: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'developer'"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
