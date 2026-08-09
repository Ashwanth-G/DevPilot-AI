"""Persistent incident API backed by PostgreSQL."""

from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser
from app.models.incident import Incident

router = APIRouter()


class IncidentCreate(BaseModel):
    title: str
    description: str | None = None
    severity: Literal["critical", "high", "medium", "low"] = "low"


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    severity: str
    status: str
    summary: str | None = None
    rootCause: str | None = None
    suggestedFix: str | None = None
    createdAt: datetime
    resolvedAt: datetime | None = None


def serialize_incident(item: Incident) -> IncidentResponse:
    analysis = item.ai_analysis or {}
    return IncidentResponse(
        id=str(item.id),
        title=item.title,
        severity=item.severity,
        status=item.status,
        summary=item.description,
        rootCause=item.root_cause,
        suggestedFix=analysis.get("suggested_fix"),
        createdAt=item.created_at,
        resolvedAt=item.updated_at if item.status == "resolved" else None,
    )


@router.get("", response_model=list[IncidentResponse])
async def list_incidents(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(50, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> list[IncidentResponse]:
    statement = (
        select(Incident)
        .where(Incident.created_by_id == int(current_user["sub"]))
        .order_by(Incident.created_at.desc())
        .limit(limit)
    )
    if status_filter:
        statement = statement.where(Incident.status == status_filter)
    return [serialize_incident(item) for item in (await db.scalars(statement)).all()]


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    payload: IncidentCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IncidentResponse:
    item = Incident(
        created_by_id=int(current_user["sub"]),
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return serialize_incident(item)


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IncidentResponse:
    item = await db.scalar(
        select(Incident).where(
            Incident.id == incident_id,
            Incident.created_by_id == int(current_user["sub"]),
        )
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return serialize_incident(item)
