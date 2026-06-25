import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
import json

from server.database import Base


class JSONEncodedDict(TypeDecorator):
    """Represents an immutable structure as a json-encoded string."""

    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return "[]"

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return []


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
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
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
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
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
    sku_actions = Column(JSONEncodedDict, default=list, nullable=False)
    guardrails = Column(JSONEncodedDict, default=list, nullable=False)
    submitted_by = Column(String(100), default="system", nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

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
    details = Column(JSONEncodedDict, default=dict, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    review = relationship("AssortmentReview", back_populates="audit_logs")
