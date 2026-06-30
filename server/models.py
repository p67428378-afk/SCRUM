"""
Module: models
Purpose: SQLAlchemy database models for products, performance metrics, and assortment decisions.
Author: Backend_Worker
Created: 2026-06-30
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base

class Product(Base):
    """
    Product model representing a snack SKU.
    """
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    brand_type = Column(String, nullable=False)  # "Private" or "National"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    performance_metrics = relationship("PerformanceMetric", back_populates="product", cascade="all, delete-orphan")


class PerformanceMetric(Base):
    """
    Performance metrics for a product.
    """
    __tablename__ = "performance_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    sales_revenue = Column(Float, nullable=False)
    units_sold = Column(Integer, nullable=False)
    profit_margin = Column(Float, nullable=False)
    in_stock_rate = Column(Float, nullable=False)
    recorded_at = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    product = relationship("Product", back_populates="performance_metrics")


class AssortmentDecision(Base):
    """
    Assortment decisions submitted for approval.
    """
    __tablename__ = "assortment_decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    scenario_name = Column(String, nullable=False)
    decision_payload = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
