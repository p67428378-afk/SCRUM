import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from server.database import Base


class Credit(Base):
    __tablename__ = "credits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(
        String(50), nullable=False, index=True
    )  # film, television, theater, commercials
    production_title = Column(String(255), nullable=False)
    role_name = Column(String(255), nullable=False)
    role_type = Column(
        String(100), nullable=True
    )  # Lead, Recurring, Guest Star, Supporting
    director = Column(String(255), nullable=True)
    release_year = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    media_type = Column(
        String(50), nullable=False, index=True
    )  # headshot, reel, press_kit
    thumbnail_url = Column(Text, nullable=True)
    full_url = Column(Text, nullable=True)
    download_url = Column(Text, nullable=True)
    embed_code = Column(Text, nullable=True)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_name = Column(String(255), nullable=False)
    sender_email = Column(String(255), nullable=False)
    project_type = Column(
        String(100), nullable=False
    )  # Film, Television, Theater, Commercial, Other
    budget = Column(String(100), nullable=True)
    project_dates = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="NEW", nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
