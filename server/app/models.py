import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base

# Helper to handle UUID type across SQLite and PostgreSQL
class GUID(String):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise String.
    """
    impl = String
    cache_ok = True

    def __init__(self, length=36, **kwargs):
        super().__init__(length, **kwargs)

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    card_identifier = Column(String(4), unique=True, nullable=False)
    daily_spend_threshold = Column(Numeric, default=5000, nullable=False)
    alert_delivery_channel = Column(String(10), default="SMS", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    current_daily_spend = Column(Numeric, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class OTPTransaction(Base):
    __tablename__ = "otp_transactions"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    otp_reference_id = Column(String(36), unique=True, nullable=False)
    mobile_number = Column(String(15), nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# --- Secure Employee Account Management Models ---

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(GUID, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id = Column(GUID, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(GUID, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)

class UserPermission(Base):
    __tablename__ = "user_permissions"

    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(GUID, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)

class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    roles = relationship("Role", secondary="user_roles", back_populates="users")
    permissions = relationship("Permission", secondary="user_permissions", back_populates="users")

class Role(Base):
    __tablename__ = "roles"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    users = relationship("User", secondary="user_roles", back_populates="roles")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    users = relationship("User", secondary="user_permissions", back_populates="permissions")
    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    action_type = Column(String(100), nullable=False)
    actor_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_id = Column(GUID, nullable=True)
    details = Column(String(1000), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    actor = relationship("User", foreign_keys=[actor_id])
