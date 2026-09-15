import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    domain = Column(String, unique=True, nullable=False, index=True)
    status = Column(
        String, default="Active", nullable=False
    )  # Active, Suspended, Deactivated
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    memberships = relationship(
        "TenantMembership", back_populates="tenant", cascade="all, delete-orphan"
    )
    config = relationship(
        "TenantConfig",
        back_populates="tenant",
        uselist=False,
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog", back_populates="tenant", cascade="all, delete-orphan"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    memberships = relationship(
        "TenantMembership", back_populates="user", cascade="all, delete-orphan"
    )


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(
        String, default="User", nullable=False
    )  # Tenant Owner, Tenant Admin, User, Viewer
    status = Column(String, default="Active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="memberships")
    user = relationship("User", back_populates="memberships")


class TenantConfig(Base):
    __tablename__ = "tenant_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(
        String(36), ForeignKey("tenants.id"), unique=True, nullable=False, index=True
    )
    rate_limit_rpm = Column(Integer, default=1000, nullable=False)
    storage_quota_gb = Column(Integer, default=50, nullable=False)
    feature_flags = Column(JSON, default=dict, nullable=False)

    tenant = relationship("Tenant", back_populates="config")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(JSON, default=dict, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="audit_logs")
