"""Harden defaults and nullability for the initial DevPilot schema.

Revision ID: 20260809_02
Revises: 20260809_01
Create Date: 2026-08-09 11:25:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260809_02"
down_revision: str | None = "20260809_01"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.execute("UPDATE users SET is_active = true WHERE is_active IS NULL")
    op.execute("UPDATE users SET is_superuser = false WHERE is_superuser IS NULL")
    op.execute("UPDATE incidents SET status = 'open' WHERE status IS NULL")
    op.execute("UPDATE incidents SET severity = 'low' WHERE severity IS NULL")
    op.execute("UPDATE incidents SET created_at = now() WHERE created_at IS NULL")

    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.text("true"),
    )
    op.alter_column(
        "users",
        "is_superuser",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    )
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        nullable=False,
        server_default=sa.text("'developer'"),
    )
    op.alter_column(
        "users",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
    )
    op.alter_column(
        "incidents",
        "status",
        existing_type=sa.String(),
        nullable=False,
        server_default=sa.text("'open'"),
    )
    op.alter_column(
        "incidents",
        "severity",
        existing_type=sa.String(),
        nullable=False,
        server_default=sa.text("'low'"),
    )
    op.alter_column(
        "incidents",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text("now()"),
    )
    op.alter_column(
        "incidents",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
    )


def downgrade() -> None:
    op.alter_column(
        "incidents",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
    )
    op.alter_column(
        "incidents",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "incidents",
        "severity",
        existing_type=sa.String(),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "incidents",
        "status",
        existing_type=sa.String(),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "users",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
    )
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        server_default=None,
    )
    op.alter_column(
        "users",
        "is_superuser",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
