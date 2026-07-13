import uuid
from sqlalchemy import Column, String, Numeric, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from server.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    sku_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand_type = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    performance = relationship(
        "SKUPerformance", back_populates="product", uselist=False
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
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    weekly_sales = Column(Numeric(12, 2), nullable=False)
    margin_percent = Column(Numeric(5, 2), nullable=False)
    shelf_space = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    product = relationship("Product", back_populates="performance")


class AssortmentScenario(Base):
    __tablename__ = "assortment_scenarios"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    name = Column(String(50), unique=True, nullable=False)
    projected_sales_change = Column(Numeric(5, 2), nullable=False)
    projected_private_brand_share = Column(Numeric(5, 2), nullable=False)
    projected_shelf_space_change = Column(Numeric(5, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class ApprovalLog(Base):
    __tablename__ = "approval_log"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    transaction_id = Column(String(100), unique=True, nullable=False)
    scenario_name = Column(String(50), nullable=False)
    submitted_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    user_name = Column(String(100), nullable=False)
    sku_action_summary = Column(JSON, nullable=False)
