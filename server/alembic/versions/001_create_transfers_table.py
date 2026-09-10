"""create transfers, users, and accounts tables

Revision ID: 001
Revises:
Create Date: 2026-09-10 10:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("handle", sa.String(length=100), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "is_verified", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_handle", "users", ["handle"], unique=True)

    # Create accounts table
    op.create_table(
        "accounts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("account_number", sa.String(length=50), nullable=False),
        sa.Column(
            "account_type",
            sa.String(length=50),
            nullable=False,
            server_default="checking",
        ),
        sa.Column(
            "balance",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0.00",
        ),
        sa.Column(
            "currency", sa.String(length=10), nullable=False, server_default="USD"
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index(
        "ix_accounts_account_number", "accounts", ["account_number"], unique=True
    )
    op.create_index("ix_accounts_user_id", "accounts", ["user_id"], unique=False)

    # Create transfers table
    op.create_table(
        "transfers",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("sender_id", sa.String(length=36), nullable=False),
        sa.Column("receiver_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "status", sa.String(length=50), nullable=False, server_default="COMPLETED"
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_transfers_sender_id", "transfers", ["sender_id"], unique=False)
    op.create_index(
        "ix_transfers_receiver_id", "transfers", ["receiver_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_transfers_receiver_id", table_name="transfers")
    op.drop_index("ix_transfers_sender_id", table_name="transfers")
    op.drop_table("transfers")
    op.drop_index("ix_accounts_user_id", table_name="accounts")
    op.drop_index("ix_accounts_account_number", table_name="accounts")
    op.drop_table("accounts")
    op.drop_index("ix_users_handle", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
