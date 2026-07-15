# SQLAlchemy Models
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


# Helper to support UUIDs on both SQLite and PostgreSQL
class GUID(String):
    """Simulated UUID type for SQLite/Postgres compatibility."""

    def __init__(self, length=36, *args, **kwargs):
        super().__init__(length=length, *args, **kwargs)


def generate_uuid():
    return str(uuid.uuid4())


class Product(Base):
    __tablename__ = "products"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    sku = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    is_private_brand = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    performance = relationship(
        "ProductPerformance", back_populates="product", uselist=False
    )


class ProductPerformance(Base):
    __tablename__ = "product_performance"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    sales = Column(Numeric, nullable=False)
    margin_pct = Column(Numeric, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    product = relationship("Product", back_populates="performance")


class AssortmentScenario(Base):
    __tablename__ = "assortment_scenarios"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)
    projected_sales_growth = Column(Numeric, nullable=False)
    projected_private_brand_pct = Column(Numeric, nullable=False)
    projected_shelf_capacity_pct = Column(Numeric, nullable=False)
    sku_actions = Column(JSON, nullable=False)


class AssortmentPlan(Base):
    __tablename__ = "assortment_plans"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    user_id = Column(String(255), nullable=False)
    scenario_name = Column(String(255), nullable=False)
    plan_details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
