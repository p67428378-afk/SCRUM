"""create transfers table

Revision ID: 001
Revises: 
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('account_number', sa.String(length=50), nullable=False),
        sa.Column('owner_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('balance', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_number')
    )
    op.create_table(
        'transfers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sender_id', sa.String(length=36), nullable=False),
        sa.Column('receiver_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['receiver_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['sender_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transfers_created_at', 'transfers', ['created_at'], unique=False)
    op.create_index('idx_transfers_receiver_id', 'transfers', ['receiver_id'], unique=False)
    op.create_index('idx_transfers_sender_id', 'transfers', ['sender_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_transfers_sender_id', table_name='transfers')
    op.drop_index('idx_transfers_receiver_id', table_name='transfers')
    op.drop_index('idx_transfers_created_at', table_name='transfers')
    op.drop_table('transfers')
    op.drop_table('accounts')
