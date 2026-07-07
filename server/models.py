import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Integer, Text, DateTime
from .database import Base


# Helper to support UUIDs on both SQLite and PostgreSQL
class GUID(String):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise String.
    """

    impl = String
    cache_ok = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


def generate_uuid():
    return str(uuid.uuid4())


class KPI(Base):
    __tablename__ = "kpis"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    sales_per_linear_ft = Column(Numeric, nullable=False)
    private_brand_pct = Column(Numeric, nullable=False)
    in_stock_rate = Column(Numeric, nullable=False)
    shelf_capacity = Column(Numeric, nullable=False)
    sales_trend_pct = Column(Numeric, nullable=False)
    private_brand_status = Column(String, nullable=False)
    in_stock_status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class SKU(Base):
    __tablename__ = "skus"

    sku = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    sales = Column(Numeric, nullable=False)
    units = Column(Integer, nullable=False)
    profit = Column(Numeric, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    projected_sales = Column(Numeric, nullable=False)
    projected_private_brand_pct = Column(Numeric, nullable=False)
    grow_count = Column(Integer, nullable=False)
    maintain_count = Column(Integer, nullable=False)
    swap_count = Column(Integer, nullable=False)
    reduce_count = Column(Integer, nullable=False)
    shelf_capacity_status = Column(String, nullable=False)
    pb_penetration_status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    scenario_name = Column(String, nullable=False)
    audit_trail = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
