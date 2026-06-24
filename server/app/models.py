"""
Module: server.app.models
Purpose: SQLAlchemy database models.
Author: Backend Developer Agent
Created: 2026-06-24
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from server.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Category Manager", nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=False)
    private_brand = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship to performance metrics
    performance_metrics = relationship(
        "PerformanceMetric", back_populates="product", cascade="all, delete-orphan"
    )


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    sales = Column(Numeric(12, 2), nullable=False)
    linear_ft = Column(Numeric(5, 2), nullable=False)
    sales_per_linear_ft = Column(Numeric(12, 2), nullable=False)
    in_stock_rate = Column(Numeric(5, 2), nullable=False)
    shelf_capacity_pct = Column(Numeric(5, 2), nullable=False)
    recommended_action = Column(String(20), nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship to product
    product = relationship("Product", back_populates="performance_metrics")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    projected_sales_per_linear_ft = Column(Numeric(12, 2), nullable=False)
    projected_private_brand_pct = Column(Numeric(5, 2), nullable=False)
    projected_in_stock_rate = Column(Numeric(5, 2), nullable=False)
    projected_shelf_capacity = Column(Numeric(5, 2), nullable=False)
    guardrails_json = Column(JSON, nullable=False)
    sku_actions_json = Column(JSON, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_name = Column(String(50), nullable=False)
    sku_actions_json = Column(JSON, nullable=False)
    submitted_by = Column(String(255), nullable=False)
    submitted_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
