import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


# Helper to generate UUID strings
def generate_uuid():
    return str(uuid.uuid4())


# Use JSON type that falls back to JSON for SQLite and JSONB for PostgreSQL
JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class Product(Base):
    __tablename__ = "products"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    sku = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    is_private_brand = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    performance = relationship(
        "ProductPerformance",
        back_populates="product",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ProductPerformance(Base):
    __tablename__ = "product_performance"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    sales = Column(Numeric, nullable=False)
    margin_pct = Column(Numeric, nullable=False)
    status = Column(String(50), nullable=False)  # GROW, MAINTAIN, SWAP, REDUCE
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    product = relationship("Product", back_populates="performance")


class AssortmentScenario(Base):
    __tablename__ = "assortment_scenarios"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    name = Column(
        String(255), unique=True, nullable=False
    )  # Conservative, Balanced, Aggressive
    projected_sales_growth = Column(Numeric, nullable=False)
    projected_private_brand_pct = Column(Numeric, nullable=False)
    projected_shelf_capacity_pct = Column(Numeric, nullable=False)
    sku_actions = Column(
        JSON_TYPE, nullable=False
    )  # List of {sku: string, action: string}


class AssortmentPlan(Base):
    __tablename__ = "assortment_plans"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    user_id = Column(String(255), nullable=False)
    scenario_name = Column(String(255), nullable=False)
    plan_details = Column(JSON_TYPE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
