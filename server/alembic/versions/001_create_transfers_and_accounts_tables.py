"""create transfers and accounts tables

Revision ID: 001_create_transfers_and_accounts
Revises:
Create Date: 2026-09-10 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from server.database import GUID

# revision identifiers, used by Alembic.
revision = "001_create_transfers_and_accounts"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("user_name", sa.String(length=100), nullable=False),
        sa.Column(
            "balance",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0.00",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "transfers",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("sender_id", GUID(), nullable=False),
        sa.Column("receiver_id", GUID(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="COMPLETED"
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["receiver_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_transfers_receiver_id"), "transfers", ["receiver_id"], unique=False
    )
    op.create_index(
        op.f("ix_transfers_sender_id"), "transfers", ["sender_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_transfers_sender_id"), table_name="transfers")
    op.drop_index(op.f("ix_transfers_receiver_id"), table_name="transfers")
    op.drop_table("transfers")
    op.drop_table("accounts")
