import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Category(Base):
    __tablename__ = "categories"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    name = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="category")


class Material(Base):
    __tablename__ = "materials"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    name = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="material")


class Gemstone(Base):
    __tablename__ = "gemstones"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    name = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="gemstone")


class Product(Base):
    __tablename__ = "products"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    name = Column(String(255), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    material_id = Column(String(36), ForeignKey("materials.id"), nullable=False)
    gemstone_id = Column(String(36), ForeignKey("gemstones.id"), nullable=True)
    carat_weight = Column(Numeric(10, 2), nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    category = relationship("Category", back_populates="products")
    material = relationship("Material", back_populates="products")
    gemstone = relationship("Gemstone", back_populates="products")
    inventory = relationship(
        "Inventory",
        back_populates="product",
        uselist=False,
        cascade="all, delete-orphan",
    )
    audit_logs = relationship("AuditLog", back_populates="product")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    product_id = Column(
        String(36), ForeignKey("products.id"), unique=True, nullable=False
    )
    stock_quantity = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    product = relationship("Product", back_populates="inventory")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        String(36), primary_key=True, default=generate_uuid, unique=True, nullable=False
    )
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    action = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
    user_id = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="audit_logs")
