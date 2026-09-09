import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Integer,
    BigInteger,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


def current_utc_time():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="actor")
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=current_utc_time
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    actor_profile = relationship(
        "ActorProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ActorProfile(Base):
    __tablename__ = "actor_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True
    )
    full_name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    bio = Column(Text, nullable=True)
    height = Column(String(20), nullable=True)
    eye_color = Column(String(30), nullable=True)
    hair_color = Column(String(30), nullable=True)
    voice_type = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    union_affiliations = Column(JSON, nullable=True, default=list)
    social_links = Column(JSON, nullable=True, default=dict)
    agent_contact_info = Column(JSON, nullable=True, default=dict)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=current_utc_time
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    user = relationship("User", back_populates="actor_profile")
    media_assets = relationship(
        "MediaAsset", back_populates="actor_profile", cascade="all, delete-orphan"
    )
    filmography_credits = relationship(
        "FilmographyCredit",
        back_populates="actor_profile",
        cascade="all, delete-orphan",
    )


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(
        String(36), ForeignKey("actor_profiles.id"), nullable=False, index=True
    )
    asset_type = Column(
        String(30), nullable=False
    )  # 'headshot', 'reel_link', 'pdf_resume'
    url = Column(Text, nullable=False)
    title = Column(String(150), nullable=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    file_size_bytes = Column(BigInteger, nullable=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=current_utc_time
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    actor_profile = relationship("ActorProfile", back_populates="media_assets")


class FilmographyCredit(Base):
    __tablename__ = "filmography_credits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(
        String(36), ForeignKey("actor_profiles.id"), nullable=False, index=True
    )
    category = Column(
        String(30), nullable=False
    )  # 'Theater', 'Film', 'Television', 'Commercials', 'Voiceover'
    production_name = Column(String(200), nullable=False)
    role_name = Column(String(150), nullable=False)
    director = Column(String(150), nullable=True)
    year = Column(Integer, nullable=False)
    additional_notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=current_utc_time
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    actor_profile = relationship("ActorProfile", back_populates="filmography_credits")
