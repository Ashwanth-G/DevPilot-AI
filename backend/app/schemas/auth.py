"""Pydantic request and response models for authentication endpoints."""

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    """Credentials supplied when signing in."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()

    @field_validator("password")
    @classmethod
    def enforce_bcrypt_byte_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 UTF-8 bytes")
        return value


class RegisterRequest(LoginRequest):
    """Credentials required to create a password-based account."""

    password: str = Field(min_length=12, max_length=72)


class UserResponse(BaseModel):
    """Safe user fields returned to the frontend."""

    id: str
    email: str
    name: str
    role: str
    avatarUrl: str | None = None
    githubLogin: str | None = None
