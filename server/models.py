import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from server.database import Base


# Helper to support JSON/JSONB across SQLite and PostgreSQL
def get_json_type():
    # We can use JSON which works on both SQLite and PostgreSQL
    return JSON


class SKU(Base):
    __tablename__ = "sku"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    sku_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    brand_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    performance = relationship(
        "SKUPerformance", back_populates="sku", cascade="all, delete-orphan"
    )


class SKUPerformance(Base):
    __tablename__ = "sku_performance"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    sku_id = Column(String(36), ForeignKey("sku.id"), nullable=False)
    sales_ytd = Column(Numeric(12, 2), default=0.00, nullable=False)
    units_sold = Column(Integer, default=0, nullable=False)
    profit_margin = Column(Numeric(5, 2), default=0.00, nullable=False)
    in_stock_rate = Column(Numeric(5, 2), default=0.00, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    sku = relationship("SKU", back_populates="performance")


class AssortmentReview(Base):
    __tablename__ = "assortment_review"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    selected_scenario = Column(String(50), nullable=False)
    sku_actions = Column(get_json_type(), default=list, nullable=False)
    guardrails = Column(get_json_type(), default=list, nullable=False)
    submitted_by = Column(String(100), default="system", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    audit_logs = relationship(
        "AuditLog", back_populates="review", cascade="all, delete-orphan"
    )


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    review_id = Column(String(36), ForeignKey("assortment_review.id"), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(get_json_type(), default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    review = relationship("AssortmentReview", back_populates="audit_logs")
