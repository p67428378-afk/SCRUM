import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, JSON
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
    name = Column(String(255), nullable=False)
    sales_performance = Column(Numeric(12, 2), nullable=False, default=0.00)
    shelf_space = Column(Numeric(5, 2), nullable=False, default=0.00)
    private_brand = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="MAINTAIN")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class AssortmentReview(Base):
    __tablename__ = "assortment_reviews"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    scenario_name = Column(String(50), nullable=False)
    user_id = Column(String(100), nullable=False)
    submission_data = Column(JSON, nullable=False, default=dict)
    audit_id = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
