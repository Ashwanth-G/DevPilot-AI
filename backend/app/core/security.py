"""Password hashing, JWT creation, and authorization dependencies."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal, TypedDict

import bcrypt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings

TokenType = Literal["access", "refresh"]


class TokenPair(TypedDict):
    """Tokens issued after successful authentication."""

    access_token: str
    refresh_token: str
    token_type: Literal["bearer"]


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""

    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""

    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def jwt_secret(token_type: TokenType) -> str:
    """Return a configured signing secret or a safe configuration error."""

    secret = settings.JWT_SECRET_KEY if token_type == "access" else settings.JWT_REFRESH_SECRET_KEY
    if not secret or secret.startswith("replace-with-"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication token signing is not configured.",
        )
    return secret


def create_token(subject: dict[str, str], token_type: TokenType) -> str:
    """Create a signed access or refresh token with the configured lifetime."""

    duration = (
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        if token_type == "access"
        else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    payload = {
        **subject,
        "exp": datetime.now(UTC) + duration,
        "type": token_type,
    }
    return jwt.encode(payload, jwt_secret(token_type), algorithm=settings.JWT_ALGORITHM)


def create_token_pair(user_id: str, email: str, role: str) -> TokenPair:
    """Create the access and refresh tokens for an authenticated user."""

    subject = {"sub": user_id, "email": email, "role": role}
    return {
        "access_token": create_token(subject, "access"),
        "refresh_token": create_token(subject, "refresh"),
        "token_type": "bearer",
    }


def decode_token(token: str, token_type: TokenType = "access") -> dict[str, str]:
    """Decode a token and enforce its expected purpose."""

    try:
        payload = jwt.decode(
            token,
            jwt_secret(token_type),
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != token_type:
            raise JWTError("Unexpected token type")
        if not isinstance(payload.get("sub"), str) or not isinstance(payload.get("email"), str):
            raise JWTError("Token subject is incomplete")
        return payload
    except JWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error


async def get_current_user_payload(
    bearer_token: Annotated[str | None, Depends(oauth2_scheme)],
    access_token: Annotated[str | None, Cookie()] = None,
) -> dict[str, str]:
    """Extract a valid access token from Authorization or the secure cookie."""

    token = bearer_token or access_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(token)


def require_role(*roles: str):
    """Return a dependency enforcing one of the supplied application roles."""

    async def check_role(
        payload: Annotated[dict[str, str], Depends(get_current_user_payload)],
    ) -> dict[str, str]:
        user_role = payload.get("role", "viewer")
        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return payload

    return check_role


CurrentUser = Annotated[dict[str, str], Depends(get_current_user_payload)]
AdminOnly = Annotated[dict[str, str], Depends(require_role("admin"))]
