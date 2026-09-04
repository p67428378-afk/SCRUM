from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- Genre Schemas ---
class GenreBase(BaseModel):
    name: str


class GenreCreate(GenreBase):
    pass


class GenreResponse(GenreBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


# --- Episode Schemas ---
class EpisodeBase(BaseModel):
    episode_number: int
    title: str
    runtime: Optional[int] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None


class EpisodeCreate(EpisodeBase):
    pass


class EpisodeResponse(EpisodeBase):
    id: str
    season_id: str

    model_config = ConfigDict(from_attributes=True)


# --- Season Schemas ---
class SeasonBase(BaseModel):
    season_number: int
    title: Optional[str] = None


class SeasonCreate(SeasonBase):
    pass


class SeasonResponse(SeasonBase):
    id: str
    series_id: str
    episodes: List[EpisodeResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Movie Schemas ---
class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    release_year: Optional[int] = None
    age_rating: Optional[str] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None
    stream_url: Optional[str] = None
    cast_members: Optional[str] = None
    status: Optional[str] = "Available"


class MovieCreate(MovieBase):
    genre_ids: Optional[List[str]] = []


class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    release_year: Optional[int] = None
    age_rating: Optional[str] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None
    stream_url: Optional[str] = None
    cast_members: Optional[str] = None
    status: Optional[str] = None
    genre_ids: Optional[List[str]] = None


class MovieResponse(MovieBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    genres: List[GenreResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Series Schemas ---
class SeriesBase(BaseModel):
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = None
    age_rating: Optional[str] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None
    cast_members: Optional[str] = None
    status: Optional[str] = "Available"


class SeriesCreate(SeriesBase):
    genre_ids: Optional[List[str]] = []


class SeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    release_year: Optional[int] = None
    age_rating: Optional[str] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None
    cast_members: Optional[str] = None
    status: Optional[str] = None
    genre_ids: Optional[List[str]] = None


class SeriesResponse(SeriesBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    genres: List[GenreResponse] = []
    seasons: List[SeasonResponse] = []

    model_config = ConfigDict(from_attributes=True)
