"""
Module: communication
Purpose: Database models for Announcement, Discussion, and Comment
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    resident = relationship("Resident", back_populates="discussions")
    comments = relationship(
        "Comment", back_populates="discussion", cascade="all, delete-orphan"
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    discussion_id = Column(String(36), ForeignKey("discussions.id"), nullable=False)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    discussion = relationship("Discussion", back_populates="comments")
    resident = relationship("Resident", back_populates="comments")
