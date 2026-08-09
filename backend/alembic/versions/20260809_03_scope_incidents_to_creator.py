"""Associate incidents with the account that created them.

Revision ID: 20260809_03
Revises: 20260809_02
Create Date: 2026-08-09 13:15:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260809_03"
down_revision: str | None = "20260809_02"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("incidents", sa.Column("created_by_id", sa.Integer(), nullable=True))
    op.create_index("ix_incidents_created_by_id", "incidents", ["created_by_id"], unique=False)
    op.create_foreign_key(
        "fk_incidents_created_by_id_users",
        "incidents",
        "users",
        ["created_by_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_incidents_created_by_id_users", "incidents", type_="foreignkey")
    op.drop_index("ix_incidents_created_by_id", table_name="incidents")
    op.drop_column("incidents", "created_by_id")
