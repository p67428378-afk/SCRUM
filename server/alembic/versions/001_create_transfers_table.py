"""create transfers and accounts tables

Revision ID: 001_create_transfers_table
Revises:
Create Date: 2026-05-18 00:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_create_transfers_table"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("balance", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_accounts_id"), "accounts", ["id"], unique=False)

    op.create_table(
        "transfers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("sender_id", sa.String(length=255), nullable=False),
        sa.Column("receiver_id", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column(
            "status", sa.String(length=32), nullable=False, server_default="COMPLETED"
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_transfers_sender_id"), "transfers", ["sender_id"], unique=False
    )
    op.create_index(
        op.f("ix_transfers_receiver_id"), "transfers", ["receiver_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_transfers_receiver_id"), table_name="transfers")
    op.drop_index(op.f("ix_transfers_sender_id"), table_name="transfers")
    op.drop_table("transfers")
    op.drop_index(op.f("ix_accounts_id"), table_name="accounts")
    op.drop_table("accounts")
