"""Add property_price_history table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-05-18 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "property_price_history",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("property_id", sa.String(length=36), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("change_event", sa.String(length=30), nullable=False),
        sa.Column("recorded_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_property_price_history_property_id"),
        "property_price_history",
        ["property_id"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_property_price_history_property_id"),
        table_name="property_price_history",
    )
    op.drop_table("property_price_history")
