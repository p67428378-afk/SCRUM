import datetime
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from server.database import Base


class LockoutState(Base):
    __tablename__ = "lockout_state"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    failed_attempts = Column(Integer, nullable=False, default=0)
    last_failed_at = Column(DateTime(timezone=True), nullable=True)
    login_flow_restarts = Column(Integer, nullable=False, default=0)
    last_restart_at = Column(DateTime(timezone=True), nullable=True)
    otp_resends = Column(Integer, nullable=False, default=0)
    last_otp_resend_at = Column(DateTime(timezone=True), nullable=True)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    otp_failures = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="lockout_state")
