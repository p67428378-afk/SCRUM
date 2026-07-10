import uuid
from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class SKU(Base):
    __tablename__ = "skus"

    sku_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    weekly_sales = Column(Numeric(10, 2), nullable=False)
    profit_margin = Column(Numeric(5, 2), nullable=False)
    private_brand = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), nullable=False)  # GROW / MAINTAIN / SWAP / REDUCE


class AssortmentSubmission(Base):
    __tablename__ = "assortment_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(100), nullable=False, unique=True, index=True)
    scenario_name = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
    )

    actions = relationship(
        "AssortmentSubmissionAction",
        back_populates="submission",
        cascade="all, delete-orphan",
    )


class AssortmentSubmissionAction(Base):
    __tablename__ = "assortment_submission_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("assortment_submissions.id"), nullable=False
    )
    sku_id = Column(String(50), nullable=False)
    action_type = Column(String(50), nullable=False)  # ADD / KEEP / SWAP / REMOVE

    submission = relationship("AssortmentSubmission", back_populates="actions")
