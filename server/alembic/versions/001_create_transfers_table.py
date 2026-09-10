"""Create accounts and transfers tables

Revision ID: 001_create_transfers_table
Revises:
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_create_transfers_table'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('account_number', sa.String(length=64), nullable=False),
        sa.Column('balance', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('owner_name', sa.String(length=128), nullable=False, server_default=''),
        sa.Column('email', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_account_number'), 'accounts', ['account_number'], unique=True)
    op.create_index(op.f('ix_accounts_email'), 'accounts', ['email'], unique=True)

    # Create transfers table
    op.create_table(
        'transfers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sender_id', sa.String(length=36), nullable=False),
        sa.Column('receiver_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='COMPLETED'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['sender_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['receiver_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transfers_sender_id'), 'transfers', ['sender_id'], unique=False)
    op.create_index(op.f('ix_transfers_receiver_id'), 'transfers', ['receiver_id'], unique=False)
    op.create_index(op.f('ix_transfers_created_at'), 'transfers', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transfers_created_at'), table_name='transfers')
    op.drop_index(op.f('ix_transfers_receiver_id'), table_name='transfers')
    op.drop_index(op.f('ix_transfers_sender_id'), table_name='transfers')
    op.drop_table('transfers')
    op.drop_index(op.f('ix_accounts_email'), table_name='accounts')
    op.drop_index(op.f('ix_accounts_account_number'), table_name='accounts')
    op.drop_table('accounts')
