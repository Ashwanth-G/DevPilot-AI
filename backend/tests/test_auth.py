"""Integration coverage for the password and cookie authentication flow."""

from __future__ import annotations

import asyncio
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import settings
from app.core.database import engine, session_factory
from app.main import app
from app.models.user import User

pytestmark = pytest.mark.skipif(
    engine is None,
    reason="DATABASE_URL is required for auth integration tests",
)


async def delete_test_user(email: str) -> None:
    """Remove the account created by this test without touching other data."""

    assert session_factory is not None
    async with session_factory() as session:
        user = await session.scalar(select(User).where(User.email == email))
        if user is not None:
            await session.delete(user)
            await session.commit()


def test_password_authentication_lifecycle(monkeypatch: pytest.MonkeyPatch) -> None:
    """Registration, login, refresh, protected access, invalid paths, and logout work."""

    monkeypatch.setattr(settings, "JWT_SECRET_KEY", "test-access-secret-" + "a" * 48)
    monkeypatch.setattr(settings, "JWT_REFRESH_SECRET_KEY", "test-refresh-secret-" + "b" * 48)
    email = f"auth-test-{uuid4().hex}@example.com"
    password = "DevPilot-auth-test-2026!"

    try:
        with TestClient(app) as client:
            assert client.get("/api/v1/auth/me").status_code == 401
            assert (
                client.post(
                    "/api/v1/auth/login",
                    json={"email": email, "password": password},
                ).status_code
                == 401
            )

            registration = client.post(
                "/api/v1/auth/register",
                json={"email": email, "password": password},
            )
            assert registration.status_code == 201
            assert registration.json()["email"] == email
            assert "httponly" in registration.headers["set-cookie"].lower()

            assert client.get("/api/v1/auth/me").status_code == 200
            assert (
                client.post(
                    "/api/v1/auth/register",
                    json={"email": email, "password": password},
                ).status_code
                == 409
            )
            assert (
                client.post(
                    "/api/v1/auth/login",
                    json={"email": email, "password": "incorrect-password"},
                ).status_code
                == 401
            )

            login = client.post(
                "/api/v1/auth/login",
                json={"email": email, "password": password},
            )
            assert login.status_code == 200
            refresh_token = client.cookies.get("refresh_token")
            assert refresh_token

            client.cookies.clear()
            refresh = client.post(
                "/api/v1/auth/refresh",
                headers={"Cookie": f"refresh_token={refresh_token}"},
            )
            assert refresh.status_code == 204
            assert client.get("/api/v1/auth/me").status_code == 200

            invalid_refresh = client.post(
                "/api/v1/auth/refresh",
                headers={"Cookie": "refresh_token=not-a-valid-token"},
            )
            assert invalid_refresh.status_code == 401

            assert client.post("/api/v1/auth/logout").status_code == 204
            assert client.get("/api/v1/auth/me").status_code == 401
    finally:
        asyncio.run(delete_test_user(email))
