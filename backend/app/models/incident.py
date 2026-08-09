"""Incident persistence model for the monitoring and investigation workflow."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Incident(Base):
    """An operational incident and its optional automated analysis."""

    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String)
    status: Mapped[str] = mapped_column(
        String, nullable=False, index=True, server_default=text("'open'")
    )
    severity: Mapped[str] = mapped_column(
        String, nullable=False, index=True, server_default=text("'low'")
    )
    root_cause: Mapped[str | None] = mapped_column(String)
    ai_analysis: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
