from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: str = "subscriber"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Episode schemas
class EpisodeCreate(BaseModel):
    episode_number: int
    title: str
    description: Optional[str] = None
    stream_url: str
    duration_seconds: Optional[int] = None


class EpisodeResponse(BaseModel):
    id: str
    season_id: str
    episode_number: int
    title: str
    description: Optional[str] = None
    stream_url: str
    duration_seconds: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Season schemas
class SeasonCreate(BaseModel):
    season_number: int
    title: Optional[str] = None
    episodes: Optional[List[EpisodeCreate]] = []


class SeasonResponse(BaseModel):
    id: str
    media_item_id: str
    season_number: int
    title: Optional[str] = None
    episodes: Optional[List[EpisodeResponse]] = []
    created_at: datetime

    class Config:
        from_attributes = True


# Movie schemas
class MovieCreate(BaseModel):
    title: str
    description: Optional[str] = None
    genre: str
    release_year: int
    cast_members: Optional[str] = None
    rating: Optional[str] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None
    is_published: bool = True


class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    cast_members: Optional[str] = None
    rating: Optional[str] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None
    is_published: Optional[bool] = None


# Series schemas
class SeriesCreate(BaseModel):
    title: str
    description: Optional[str] = None
    genre: str
    release_year: int
    cast_members: Optional[str] = None
    rating: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: bool = True
    seasons: Optional[List[SeasonCreate]] = []


class SeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    cast_members: Optional[str] = None
    rating: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


# MediaItem general response
class MediaItemResponse(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    genre: str
    release_year: int
    cast_members: Optional[str] = None
    rating: Optional[str] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None
    is_published: bool
    seasons: Optional[List[SeasonResponse]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Watchlist schemas
class WatchlistCreate(BaseModel):
    media_item_id: str


class WatchlistResponse(BaseModel):
    id: str
    user_id: str
    media_item_id: str
    created_at: datetime
    media_item: Optional[MediaItemResponse] = None

    class Config:
        from_attributes = True


# WatchHistory schemas
class WatchHistoryCreate(BaseModel):
    media_item_id: str
    episode_id: Optional[str] = None
    progress_seconds: int = Field(0, ge=0)
    completed: bool = False


class WatchHistoryResponse(BaseModel):
    id: str
    user_id: str
    media_item_id: str
    episode_id: Optional[str] = None
    progress_seconds: int
    completed: bool
    updated_at: datetime
    media_item: Optional[MediaItemResponse] = None
    episode: Optional[EpisodeResponse] = None

    class Config:
        from_attributes = True


# Search schema
class SearchResponse(BaseModel):
    results: List[MediaItemResponse]
    total: int
