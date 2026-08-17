import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        String(50), nullable=False, default="Employee"
    )  # Employee, Manager, Admin
    manager_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    manager = relationship("User", remote_side=[id], backref="subordinates")
    attendance_events = relationship(
        "AttendanceEvent", back_populates="user", cascade="all, delete-orphan"
    )
    adjustment_requests = relationship(
        "AttendanceAdjustmentRequest",
        foreign_keys="[AttendanceAdjustmentRequest.user_id]",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    approved_requests = relationship(
        "AttendanceAdjustmentRequest",
        foreign_keys="[AttendanceAdjustmentRequest.approver_id]",
        back_populates="approver",
    )
    audit_logs = relationship("AttendanceAuditLog", back_populates="editor")


class AttendanceEvent(Base):
    __tablename__ = "attendance_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=False)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        String(50), nullable=False, default="Incomplete"
    )  # Present, Late, Absent, Half-Day, Incomplete
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="attendance_events")
    audit_logs = relationship(
        "AttendanceAuditLog", back_populates="event", cascade="all, delete-orphan"
    )


class AttendanceAdjustmentRequest(Base):
    __tablename__ = "attendance_adjustment_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    approver_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    requested_check_in = Column(DateTime(timezone=True), nullable=True)
    requested_check_out = Column(DateTime(timezone=True), nullable=True)
    reason = Column(String(1000), nullable=False)
    status = Column(
        String(50), nullable=False, default="Pending"
    )  # Pending, Approved, Rejected
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    user = relationship(
        "User", foreign_keys=[user_id], back_populates="adjustment_requests"
    )
    approver = relationship(
        "User", foreign_keys=[approver_id], back_populates="approved_requests"
    )


class AttendanceAuditLog(Base):
    __tablename__ = "attendance_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    editor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(36), ForeignKey("attendance_events.id"), nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(String(1000), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    editor = relationship("User", back_populates="audit_logs")
    event = relationship("AttendanceEvent", back_populates="audit_logs")
