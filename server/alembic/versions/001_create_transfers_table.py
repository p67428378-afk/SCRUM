"""create transfers and accounts tables

Revision ID: 001_create_transfers_table
Revises:
Create Date: 2026-09-10 12:00:00.000000

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
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Create accounts table
    op.create_table(
        "accounts",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("user_id", sa.CHAR(length=36), nullable=True),
        sa.Column("account_number", sa.String(length=50), nullable=False),
        sa.Column("balance", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column(
            "currency", sa.String(length=10), nullable=False, server_default="USD"
        ),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="ACTIVE"
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_number"),
        sa.CheckConstraint("balance >= 0", name="check_account_positive_balance"),
    )
    op.create_index(op.f("ix_accounts_user_id"), "accounts", ["user_id"], unique=False)

    # Create transfers table
    op.create_table(
        "transfers",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("sender_id", sa.CHAR(length=36), nullable=False),
        sa.Column("receiver_id", sa.CHAR(length=36), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="COMPLETED"
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("amount > 0", name="check_transfer_positive_amount"),
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
    op.drop_index(op.f("ix_accounts_user_id"), table_name="accounts")
    op.drop_table("accounts")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
