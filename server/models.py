import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, Index
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), index=True, nullable=False)
    action_type = Column(String(100), nullable=False)
    status = Column(
        String(20), default="pending", index=True, nullable=False
    )  # pending, success, failed
    result = Column(JSON, nullable=True)
    error_code = Column(String(50), nullable=True)
    error_reason = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (Index("idx_tasks_user_id_id", "user_id", "id"),)
