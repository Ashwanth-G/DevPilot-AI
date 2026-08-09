"""Cookie-based authentication backed by the DevPilot PostgreSQL database."""

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    CurrentUser,
    create_token_pair,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse

router = APIRouter()


def serialize_user(user: User) -> UserResponse:
    """Return frontend-safe fields for an account."""

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.email.split("@", 1)[0],
        role=user.role,
        githubLogin=user.github_id,
    )


def set_auth_cookies(response: Response, tokens: dict[str, str]) -> None:
    """Set HTTP-only session cookies for a successful authentication action."""

    shared = {
        "httponly": True,
        "secure": settings.is_production,
        "samesite": "lax",
        "path": "/",
    }
    response.set_cookie(
        "access_token",
        tokens["access_token"],
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **shared,
    )
    response.set_cookie(
        "refresh_token",
        tokens["refresh_token"],
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **shared,
    )


def clear_auth_cookies(response: Response) -> None:
    """Expire both authentication cookies."""

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def ensure_demo_user(db: AsyncSession, email: str) -> User | None:
    """Create the configured development demo account once when requested."""

    if (
        not settings.DEMO_MODE
        or not settings.DEMO_USER_PASSWORD
        or email != settings.DEMO_USER_EMAIL.lower()
    ):
        return None

    user = User(
        email=settings.DEMO_USER_EMAIL.lower(),
        hashed_password=hash_password(settings.DEMO_USER_PASSWORD),
        role="developer",
    )
    db.add(user)
    await db.flush()
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Create a password-based DevPilot account and start its session."""

    existing_user = await db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="developer",
    )
    db.add(user)
    await db.flush()
    set_auth_cookies(response, create_token_pair(str(user.id), user.email, user.role))
    return serialize_user(user)


@router.post("/login", response_model=UserResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Verify credentials and create a browser session."""

    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None:
        user = await ensure_demo_user(db, payload.email)
    if (
        user is None
        or not user.is_active
        or not user.hashed_password
        or not verify_password(payload.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    set_auth_cookies(response, create_token_pair(str(user.id), user.email, user.role))
    return serialize_user(user)


@router.post("/refresh", status_code=status.HTTP_204_NO_CONTENT)
async def refresh(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> Response:
    """Rotate the cookie pair when presented with a valid refresh token."""

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    payload = decode_token(refresh_token, token_type="refresh")
    set_auth_cookies(
        response,
        create_token_pair(payload["sub"], payload["email"], payload.get("role", "developer")),
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Return the authenticated account if it remains active."""

    user = await db.get(User, int(current_user["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return serialize_user(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    """End the browser session by removing its cookies."""

    clear_auth_cookies(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
