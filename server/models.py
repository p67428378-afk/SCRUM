import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from server.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class SKU(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku_code = Column(String(50), unique=True, nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Snacks")
    cluster_id = Column(String(100), nullable=False, default="Small Town Value Cluster")
    is_private_brand = Column(Boolean, nullable=False, default=False)
    weekly_units_sold = Column(Float, nullable=False, default=0.0)
    sales_per_linear_ft = Column(Float, nullable=False, default=0.0)
    margin_percentage = Column(Float, nullable=False, default=0.0)
    linear_ft_allocated = Column(Float, nullable=False, default=1.0)
    status_badge = Column(String(20), nullable=False, default="MAINTAIN")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)


class ClusterMetric(Base):
    __tablename__ = "cluster_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_name = Column(String(100), nullable=False, default="Small Town Value Cluster")
    category = Column(String(100), nullable=False, default="Snacks")
    sales_per_linear_ft = Column(Float, nullable=False)
    private_brand_percentage = Column(Float, nullable=False)
    in_stock_rate = Column(Float, nullable=False)
    shelf_capacity_utilization = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)


class ScenarioConfig(Base):
    __tablename__ = "scenario_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_type = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    projected_sales_lift_pct = Column(Float, nullable=False)
    projected_pb_share_pct = Column(Float, nullable=False)
    projected_capacity_pct = Column(Float, nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)
    grow_count = Column(Integer, nullable=False, default=0)
    maintain_count = Column(Integer, nullable=False, default=0)
    swap_count = Column(Integer, nullable=False, default=0)
    reduce_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)


class SubmissionAudit(Base):
    __tablename__ = "submission_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_code = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(String(100), nullable=False)
    cluster_name = Column(String(100), nullable=False, default="Small Town Value Cluster")
    category = Column(String(100), nullable=False, default="Snacks")
    selected_scenario = Column(String(50), nullable=False)
    grow_count = Column(Integer, nullable=False, default=0)
    maintain_count = Column(Integer, nullable=False, default=0)
    swap_count = Column(Integer, nullable=False, default=0)
    reduce_count = Column(Integer, nullable=False, default=0)
    guardrail_status = Column(String(20), nullable=False, default="PASSED")
    submitted_at = Column(DateTime(timezone=True), default=get_utc_now)
