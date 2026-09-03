import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="owner", nullable=False)  # owner, designer, admin
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    designs = relationship(
        "DesignPost", back_populates="designer", cascade="all, delete-orphan"
    )
    boards = relationship(
        "ProjectBoard", back_populates="user", cascade="all, delete-orphan"
    )
    received_leads = relationship(
        "ConsultationLead",
        foreign_keys="ConsultationLead.designer_id",
        back_populates="designer",
        cascade="all, delete-orphan",
    )


class DesignPost(Base):
    __tablename__ = "design_posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    designer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    style = Column(
        String(100), nullable=False, index=True
    )  # Industrial, Minimalist, Scandinavian, Rustic, Vintage, Modern
    layout_size = Column(
        String(100), nullable=False, index=True
    )  # Compact (<500 sq ft), Medium (500-1500 sq ft), Large (>1500 sq ft)
    budget_tier = Column(
        String(100), nullable=False, index=True
    )  # Economy ($), Mid-Range ($$), Luxury ($$$)
    color_scheme = Column(
        String(100), nullable=True, index=True
    )  # Warm Earthy, Monochrome, Pastel, Dark Moody, Vibrant
    bookmark_count = Column(Integer, default=0, nullable=False)
    cover_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

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
        String(36), ForeignKey("design_posts.id"), nullable=True, index=True
    )
    asset_type = Column(
        String(50), nullable=False
    )  # mood_board, floor_plan, material_spec
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    post = relationship("DesignPost", back_populates="media_assets")


class ProjectBoard(Base):
    __tablename__ = "project_boards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="boards")
    bookmarks = relationship(
        "Bookmark", back_populates="board", cascade="all, delete-orphan"
    )


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    board_id = Column(
        String(36), ForeignKey("project_boards.id"), nullable=False, index=True
    )
    post_id = Column(
        String(36), ForeignKey("design_posts.id"), nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("board_id", "post_id", name="uq_board_post"),)

    board = relationship("ProjectBoard", back_populates="bookmarks")
    post = relationship("DesignPost", back_populates="bookmarks")


class ConsultationLead(Base):
    __tablename__ = "consultation_leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    designer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(
        String(36), ForeignKey("design_posts.id"), nullable=True, index=True
    )
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    client_phone = Column(String(50), nullable=True)
    cafe_location = Column(String(255), nullable=False)
    estimated_budget = Column(String(100), nullable=False)
    project_timeline = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(
        String(50), default="new", nullable=False
    )  # new, in_review, contacted, closed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    designer = relationship(
        "User", foreign_keys=[designer_id], back_populates="received_leads"
    )
    post = relationship("DesignPost", back_populates="leads")
