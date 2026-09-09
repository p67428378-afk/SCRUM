"""create transfers and accounts

Revision ID: 001_create_transfers_and_accounts
Revises: 
Create Date: 2026-05-18 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_create_transfers_and_accounts'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('account_number', sa.String(length=64), nullable=False),
        sa.Column('balance', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_account_number'), 'accounts', ['account_number'], unique=True)

    op.create_table(
        'transfers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sender_id', sa.String(length=36), nullable=False),
        sa.Column('receiver_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('amount > 0', name='check_transfer_amount_positive'),
        sa.ForeignKeyConstraint(['receiver_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transfers_receiver_id'), 'transfers', ['receiver_id'], unique=False)
    op.create_index(op.f('ix_transfers_sender_id'), 'transfers', ['sender_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transfers_sender_id'), table_name='transfers')
    op.drop_index(op.f('ix_transfers_receiver_id'), table_name='transfers')
    op.drop_table('transfers')
    op.drop_index(op.f('ix_accounts_account_number'), table_name='accounts')
    op.drop_table('accounts')
