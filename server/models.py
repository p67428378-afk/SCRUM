import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Date,
    Numeric,
    Integer,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from .database import Base


class SKU(Base):
    __tablename__ = "skus"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    sku_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    is_private_brand = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    performance = relationship(
        "SKUPerformance", back_populates="sku", cascade="all, delete-orphan"
    )
    actions = relationship("SubmissionSKUAction", back_populates="sku")


class SKUPerformance(Base):
    __tablename__ = "sku_performance"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    sku_id = Column(String(36), ForeignKey("skus.id"), nullable=False)
    reporting_week = Column(Date, nullable=False)
    weekly_sales = Column(Numeric(10, 2), default=0.0, nullable=False)
    sales_trend_wow = Column(Numeric(5, 2), default=0.0, nullable=False)
    profit_margin = Column(Numeric(5, 2), default=0.0, nullable=False)
    days_of_supply = Column(Integer, default=0, nullable=False)
    recommendation_status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    sku = relationship("SKU", back_populates="performance")


class AssortmentSubmission(Base):
    __tablename__ = "assortment_submissions"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    user_id = Column(String(100), nullable=False)
    scenario_name = Column(String(100), nullable=False)
    projected_sales_lift = Column(Numeric(5, 2), default=0.0, nullable=False)
    projected_private_brand_pct = Column(Numeric(5, 2), default=0.0, nullable=False)
    guardrail_status = Column(JSON, default=dict, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    sku_actions = relationship(
        "SubmissionSKUAction", back_populates="submission", cascade="all, delete-orphan"
    )


class SubmissionSKUAction(Base):
    __tablename__ = "submission_sku_actions"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    submission_id = Column(
        String(36), ForeignKey("assortment_submissions.id"), nullable=False
    )
    sku_id = Column(String(36), ForeignKey("skus.id"), nullable=False)
    action = Column(String(50), nullable=False)

    submission = relationship("AssortmentSubmission", back_populates="sku_actions")
    sku = relationship("SKU", back_populates="actions")
