import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    username = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    customer_id = Column(String(255), unique=True, nullable=False)
    mfa_secret = Column(String(255), nullable=True, default=None)
    phone_number = Column(String(50), nullable=True, default=None)
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_login_at = Column(DateTime, nullable=True, default=None)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Security questions for password recovery
    security_question = Column(String(255), nullable=True, default=None)
    security_answer_hash = Column(String(255), nullable=True, default=None)

    # Temporary account locking
    locked_until = Column(DateTime, nullable=True, default=None)

    mfa_codes = relationship(
        "MFACode", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="user", cascade="all, delete-orphan"
    )


class MFACode(Base):
    __tablename__ = "mfa_codes"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="mfa_codes")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    event_type = Column(String(100), nullable=False)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
    )
    source_ip = Column(String(45), nullable=True, default=None)
    user_agent = Column(String(255), nullable=True, default=None)
    details = Column(JSON, nullable=True, default=None)

    user = relationship("User", back_populates="audit_logs")
