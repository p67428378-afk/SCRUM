import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Integer,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        String(50), default="cafe_owner", nullable=False
    )  # 'cafe_owner', 'designer', 'admin'
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    designs = relationship(
        "DesignPost", back_populates="designer", cascade="all, delete-orphan"
    )
    boards = relationship(
        "ProjectBoard", back_populates="user", cascade="all, delete-orphan"
    )
    leads_received = relationship(
        "ConsultationLead",
        back_populates="designer",
        foreign_keys="ConsultationLead.designer_id",
        cascade="all, delete-orphan",
    )


class DesignPost(Base):
    __tablename__ = "design_posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    designer_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    style = Column(
        String(100), nullable=False, index=True
    )  # Industrial, Minimalist, Vintage, etc.
    layout_size = Column(
        String(100), nullable=False, index=True
    )  # Small (< 500 sq ft), Medium, Large
    budget_tier = Column(
        String(100), nullable=False, index=True
    )  # Budget ($), Mid-Range ($$), Premium, Luxury
    color_scheme = Column(
        String(100), nullable=True, index=True
    )  # Warm Earth, Monochrome, Emerald & Brass, etc.
    cover_image_url = Column(String(1024), nullable=True)
    specifications = Column(
        JSON, nullable=True
    )  # e.g., dimensions, seating capacity, materials
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    designer = relationship("User", back_populates="designs")
    media_assets = relationship(
        "MediaAsset", back_populates="post", cascade="all, delete-orphan"
    )
    bookmarks = relationship(
        "Bookmark", back_populates="post", cascade="all, delete-orphan"
    )
    leads = relationship(
        "ConsultationLead", back_populates="post", cascade="all, delete-orphan"
    )


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(
        String(36),
        ForeignKey("design_posts.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    asset_type = Column(
        String(50), nullable=False
    )  # 'mood_board', 'floor_plan', 'material_spec'
    filename = Column(String(255), nullable=False)
    file_url = Column(String(1024), nullable=False)
    file_type = Column(
        String(100), nullable=False
    )  # MIME type: image/jpeg, application/pdf, etc.
    file_size_bytes = Column(Integer, nullable=False)
    status = Column(
        String(50), default="pending", nullable=False
    )  # 'pending', 'uploaded', 'attached'
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    post = relationship("DesignPost", back_populates="media_assets")


class ProjectBoard(Base):
    __tablename__ = "project_boards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="boards")
    bookmarks = relationship(
        "Bookmark", back_populates="board", cascade="all, delete-orphan"
    )


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("board_id", "post_id", name="uq_board_post_bookmark"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_id = Column(
        String(36),
        ForeignKey("project_boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_id = Column(
        String(36),
        ForeignKey("design_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    board = relationship("ProjectBoard", back_populates="bookmarks")
    post = relationship("DesignPost", back_populates="bookmarks")


class ConsultationLead(Base):
    __tablename__ = "consultation_leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    designer_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_id = Column(
        String(36),
        ForeignKey("design_posts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=True)
    client_phone = Column(String(50), nullable=True)
    cafe_location = Column(String(255), nullable=False)
    estimated_budget = Column(String(100), nullable=False)
    project_timeline = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(
        String(50), default="new", nullable=False
    )  # 'new', 'in_review', 'contacted', 'closed'
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    designer = relationship(
        "User", foreign_keys=[designer_id], back_populates="leads_received"
    )
    post = relationship("DesignPost", back_populates="leads")
