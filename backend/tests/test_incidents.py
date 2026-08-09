"""Integration coverage for account-scoped incident management."""

from __future__ import annotations

import asyncio
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from app.core.config import settings
from app.core.database import engine, session_factory
from app.main import app
from app.models.incident import Incident
from app.models.user import User

pytestmark = pytest.mark.skipif(
    engine is None,
    reason="DATABASE_URL is required for incident integration tests",
)


async def delete_test_accounts(emails: list[str]) -> None:
    """Remove test incidents and accounts without affecting other data."""

    assert session_factory is not None
    async with session_factory() as session:
        user_ids = list(
            (await session.scalars(select(User.id).where(User.email.in_(emails)))).all()
        )
        if user_ids:
            await session.execute(delete(Incident).where(Incident.created_by_id.in_(user_ids)))
            await session.execute(delete(User).where(User.id.in_(user_ids)))
        await session.commit()


def test_incidents_are_scoped_to_the_creating_account(monkeypatch: pytest.MonkeyPatch) -> None:
    """An account can only create, list, and retrieve its own incidents."""

    monkeypatch.setattr(settings, "JWT_SECRET_KEY", "test-access-secret-" + "a" * 48)
    monkeypatch.setattr(settings, "JWT_REFRESH_SECRET_KEY", "test-refresh-secret-" + "b" * 48)
    owner_email = f"incident-owner-{uuid4().hex}@example.com"
    other_email = f"incident-other-{uuid4().hex}@example.com"
    password = "DevPilot-incident-test-2026!"

    try:
        with TestClient(app) as unauthenticated_client:
            assert unauthenticated_client.get("/api/v1/incidents").status_code == 401

        with TestClient(app) as owner_client:
            assert (
                owner_client.post(
                    "/api/v1/auth/register",
                    json={"email": owner_email, "password": password},
                ).status_code
                == 201
            )
            created = owner_client.post(
                "/api/v1/incidents",
                json={
                    "title": "Database connection errors",
                    "description": "Connections are intermittently timing out.",
                    "severity": "high",
                },
            )
            assert created.status_code == 201
            incident = created.json()
            assert incident["title"] == "Database connection errors"
            assert incident["severity"] == "high"

            listed = owner_client.get("/api/v1/incidents")
            assert listed.status_code == 200
            assert [item["id"] for item in listed.json()] == [incident["id"]]
            assert owner_client.get(f"/api/v1/incidents/{incident['id']}").status_code == 200

        with TestClient(app) as other_client:
            assert (
                other_client.post(
                    "/api/v1/auth/register",
                    json={"email": other_email, "password": password},
                ).status_code
                == 201
            )
            assert other_client.get("/api/v1/incidents").json() == []
            assert other_client.get(f"/api/v1/incidents/{incident['id']}").status_code == 404
    finally:
        asyncio.run(delete_test_accounts([owner_email, other_email]))
