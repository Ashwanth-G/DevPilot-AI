"""Create the schema used by the original DevPilot application.

This baseline deliberately mirrors the pre-Alembic SQLAlchemy schema. Existing
local databases created before migrations can be stamped at this revision and
then upgraded safely to the hardened schema in the next revision.

Revision ID: 20260809_01
Revises:
Create Date: 2026-08-09 11:15:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260809_01"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("is_superuser", sa.Boolean(), nullable=True),
        sa.Column("github_id", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("github_id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_index("ix_users_github_id", "users", ["github_id"], unique=False)

    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("severity", sa.String(), nullable=True),
        sa.Column("root_cause", sa.String(), nullable=True),
        sa.Column("ai_analysis", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_incidents_id", "incidents", ["id"], unique=False)
    op.create_index("ix_incidents_status", "incidents", ["status"], unique=False)
    op.create_index("ix_incidents_severity", "incidents", ["severity"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_incidents_severity", table_name="incidents")
    op.drop_index("ix_incidents_status", table_name="incidents")
    op.drop_index("ix_incidents_id", table_name="incidents")
    op.drop_table("incidents")
    op.drop_index("ix_users_github_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
