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
    Table,
)
from sqlalchemy.orm import relationship
from server.database import Base

movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column(
        "movie_id",
        String(36),
        ForeignKey("movies.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "genre_id",
        String(36),
        ForeignKey("genres.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

series_genres = Table(
    "series_genres",
    Base.metadata,
    Column(
        "series_id",
        String(36),
        ForeignKey("series.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "genre_id",
        String(36),
        ForeignKey("genres.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user" or "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class Genre(Base):
    __tablename__ = "genres"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)


class Movie(Base):
    __tablename__ = "movies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)
    release_year = Column(Integer, nullable=True)
    age_rating = Column(String(50), nullable=True)
    poster_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    stream_url = Column(String(500), nullable=True)
    cast_members = Column(Text, nullable=True)
    status = Column(
        String(50), default="Available", nullable=False
    )  # "Available", "Draft", "SoftDeleted"
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    genres = relationship("Genre", secondary=movie_genres, backref="movies")


class Series(Base):
    __tablename__ = "series"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    release_year = Column(Integer, nullable=True)
    age_rating = Column(String(50), nullable=True)
    poster_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    cast_members = Column(Text, nullable=True)
    status = Column(
        String(50), default="Available", nullable=False
    )  # "Available", "Draft", "SoftDeleted"
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    genres = relationship("Genre", secondary=series_genres, backref="series_list")
    seasons = relationship(
        "Season",
        back_populates="series",
        cascade="all, delete-orphan",
        order_by="Season.season_number",
    )


class Season(Base):
    __tablename__ = "seasons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    series_id = Column(
        String(36), ForeignKey("series.id", ondelete="CASCADE"), nullable=False
    )
    season_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)

    series = relationship("Series", back_populates="seasons")
    episodes = relationship(
        "Episode",
        back_populates="season",
        cascade="all, delete-orphan",
        order_by="Episode.episode_number",
    )


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    season_id = Column(
        String(36), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )
    episode_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    runtime = Column(Integer, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    stream_url = Column(String(500), nullable=True)

    season = relationship("Season", back_populates="episodes")
