from typing import Optional, List, Generic, TypeVar
from datetime import datetime
from pydantic import BaseModel, EmailStr

T = TypeVar("T")


# Auth / User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# Genre Schemas
class GenreBase(BaseModel):
    name: str


class GenreCreate(GenreBase):
    pass


class GenreResponse(GenreBase):
    id: str

    class Config:
        from_attributes = True


# Episode Schemas
class EpisodeBase(BaseModel):
    episode_number: int
    title: str
    runtime: Optional[int] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None


class EpisodeCreate(EpisodeBase):
    pass


class EpisodeUpdate(BaseModel):
    episode_number: Optional[int] = None
    title: Optional[str] = None
    runtime: Optional[int] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None


class EpisodeResponse(EpisodeBase):
    id: str
    season_id: str

    class Config:
        from_attributes = True


# Season Schemas
class SeasonBase(BaseModel):
    season_number: int
    title: Optional[str] = None


class SeasonCreate(SeasonBase):
    pass


class SeasonUpdate(BaseModel):
    season_number: Optional[int] = None
    title: Optional[str] = None


class SeasonResponse(SeasonBase):
    id: str
    series_id: str
    episodes: List[EpisodeResponse] = []

    class Config:
        from_attributes = True


# Movie Schemas
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
    genre_names: Optional[List[str]] = []


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
    genre_names: Optional[List[str]] = None


class MovieResponse(MovieBase):
    id: str
    genres: List[GenreResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Series Schemas
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
    genre_names: Optional[List[str]] = []


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
    genre_names: Optional[List[str]] = None


class SeriesResponse(SeriesBase):
    id: str
    genres: List[GenreResponse] = []
    seasons: List[SeasonResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Paginated Result
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
