import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from .database import Base


class Todo(Base):
    __tablename__ = "todos"

    # Use String(36) as fallback for SQLite, but UUID type for PostgreSQL
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    isDeleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
