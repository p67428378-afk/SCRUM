"""create_transfers_table

Revision ID: 001_create_transfers_table
Revises: 
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from server.database import GUID

# revision identifiers, used by Alembic.
revision: str = '001_create_transfers_table'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'accounts',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('account_name', sa.String(length=128), nullable=False),
        sa.Column('balance', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=8), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'transfers',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('sender_id', GUID(), nullable=False),
        sa.Column('receiver_id', GUID(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transfers_sender_id'), 'transfers', ['sender_id'], unique=False)
    op.create_index(op.f('ix_transfers_receiver_id'), 'transfers', ['receiver_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transfers_receiver_id'), table_name='transfers')
    op.drop_index(op.f('ix_transfers_sender_id'), table_name='transfers')
    op.drop_table('transfers')
    op.drop_table('accounts')
