import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="subscriber", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    watchlists = relationship(
        "Watchlist", back_populates="user", cascade="all, delete-orphan"
    )
    watch_histories = relationship(
        "WatchHistory", back_populates="user", cascade="all, delete-orphan"
    )


class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String(20), nullable=False)  # 'movie' or 'series'
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    genre = Column(String(100), nullable=False, index=True)
    release_year = Column(Integer, nullable=False, index=True)
    cast_members = Column(Text, nullable=True)
    rating = Column(String(10), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    stream_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    seasons = relationship(
        "Season", back_populates="media_item", cascade="all, delete-orphan"
    )
    watchlists = relationship(
        "Watchlist", back_populates="media_item", cascade="all, delete-orphan"
    )
    watch_histories = relationship(
        "WatchHistory", back_populates="media_item", cascade="all, delete-orphan"
    )


class Season(Base):
    __tablename__ = "seasons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    media_item_id = Column(
        String(36), ForeignKey("media_items.id", ondelete="CASCADE"), nullable=False
    )
    season_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    media_item = relationship("MediaItem", back_populates="seasons")
    episodes = relationship(
        "Episode", back_populates="season", cascade="all, delete-orphan"
    )


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    season_id = Column(
        String(36), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )
    episode_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    stream_url = Column(String(500), nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    season = relationship("Season", back_populates="episodes")
    watch_histories = relationship(
        "WatchHistory", back_populates="episode", cascade="all, delete-orphan"
    )


class Watchlist(Base):
    __tablename__ = "watchlists"
    __table_args__ = (
        UniqueConstraint("user_id", "media_item_id", name="uq_user_watchlist_media"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    media_item_id = Column(
        String(36),
        ForeignKey("media_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="watchlists")
    media_item = relationship("MediaItem", back_populates="watchlists")


class WatchHistory(Base):
    __tablename__ = "watch_histories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    media_item_id = Column(
        String(36),
        ForeignKey("media_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    episode_id = Column(
        String(36), ForeignKey("episodes.id", ondelete="SET NULL"), nullable=True
    )
    progress_seconds = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", back_populates="watch_histories")
    media_item = relationship("MediaItem", back_populates="watch_histories")
    episode = relationship("Episode", back_populates="watch_histories")
