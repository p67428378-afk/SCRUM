import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="category_manager", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class SKU(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku_code = Column(String(50), unique=True, index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    sub_category = Column(String(100), nullable=False)
    brand_type = Column(
        String(50), nullable=False
    )  # 'Private Brand' or 'National Brand'
    sales_per_linear_ft = Column(Float, default=0.0, nullable=False)
    margin_pct = Column(Float, default=0.0, nullable=False)
    units_sold = Column(Integer, default=0, nullable=False)
    action_badge = Column(
        String(50), default="MAINTAIN", nullable=False
    )  # GROW, MAINTAIN, SWAP, REDUCE
    shelf_space_inches = Column(Float, default=12.0, nullable=False)
    current_stock = Column(Integer, default=50, nullable=False)
    in_stock_rate = Column(Float, default=96.5, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class ClusterMetric(Base):
    __tablename__ = "cluster_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_name = Column(
        String(100), default="Small Town Value Cluster", nullable=False
    )
    sales_per_linear_ft = Column(Float, default=1250.0, nullable=False)
    private_brand_pct = Column(Float, default=28.0, nullable=False)
    in_stock_rate = Column(Float, default=96.5, nullable=False)
    shelf_capacity_pct = Column(Float, default=92.0, nullable=False)
    total_skus = Column(Integer, default=36, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class ScenarioConfig(Base):
    __tablename__ = "scenario_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_key = Column(
        String(50), unique=True, index=True, nullable=False
    )  # conservative, balanced, aggressive
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    projected_sales_lift_pct = Column(Float, default=0.0, nullable=False)
    projected_private_brand_pct = Column(Float, default=0.0, nullable=False)
    projected_shelf_capacity_pct = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(50), default="Moderate", nullable=False)
    grow_count = Column(Integer, default=0, nullable=False)
    maintain_count = Column(Integer, default=0, nullable=False)
    swap_count = Column(Integer, default=0, nullable=False)
    reduce_count = Column(Integer, default=0, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class SubmissionAudit(Base):
    __tablename__ = "submission_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(100), default="user@dollargeneral.com", nullable=False)
    cluster_name = Column(
        String(100), default="Small Town Value Cluster", nullable=False
    )
    scenario = Column(String(50), default="Balanced", nullable=False)
    total_modified_skus = Column(Integer, default=18, nullable=False)
    guardrail_status = Column(String(50), default="ALL PASSED", nullable=False)
    status = Column(String(50), default="APPROVED", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )
