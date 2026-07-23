import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, JSON
from server.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku_id = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    weekly_sales = Column(Numeric(12, 2), nullable=True)
    profit_margin = Column(Numeric(5, 4), nullable=True)
    status = Column(String(20), nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    projected_sales_lift = Column(Numeric(5, 4), nullable=True)
    private_brand_impact = Column(Numeric(5, 4), nullable=True)
    actions = Column(JSON, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class AssortmentSubmission(Base):
    __tablename__ = "assortment_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_name = Column(String(50), nullable=False)
    submitted_by = Column(String(255), nullable=False)
    submission_details = Column(JSON, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
