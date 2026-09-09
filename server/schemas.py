from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field


# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Profile Schemas ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    height: Optional[str] = None
    eye_color: Optional[str] = None
    hair_color: Optional[str] = None
    voice_type: Optional[str] = None
    location: Optional[str] = None
    union_affiliations: Optional[list[str]] = None
    social_links: Optional[dict[str, Any]] = None
    agent_contact_info: Optional[dict[str, Any]] = None


class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    slug: str
    bio: Optional[str] = None
    height: Optional[str] = None
    eye_color: Optional[str] = None
    hair_color: Optional[str] = None
    voice_type: Optional[str] = None
    location: Optional[str] = None
    union_affiliations: Optional[list[str]] = []
    social_links: Optional[dict[str, Any]] = {}
    agent_contact_info: Optional[dict[str, Any]] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Media Schemas ---
class UploadUrlRequest(BaseModel):
    filename: str
    file_type: str
    asset_type: str = Field(..., description="headshot, reel_link, or pdf_resume")


class UploadUrlResponse(BaseModel):
    upload_url: str
    public_url: str
    asset_id: str


class MediaCreate(BaseModel):
    asset_type: str
    url: str
    title: Optional[str] = None
    is_primary: bool = False
    file_size_bytes: Optional[int] = None


class MediaOut(BaseModel):
    id: str
    actor_id: str
    asset_type: str
    url: str
    title: Optional[str] = None
    is_primary: bool = False
    file_size_bytes: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Credit Schemas ---
class CreditCreate(BaseModel):
    category: str = Field(
        ..., description="Theater, Film, Television, Commercials, Voiceover"
    )
    production_name: str
    role_name: str
    director: Optional[str] = None
    year: int
    additional_notes: Optional[str] = None


class CreditOut(BaseModel):
    id: str
    actor_id: str
    category: str
    production_name: str
    role_name: str
    director: Optional[str] = None
    year: int
    additional_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Public Portfolio Schema ---
class PublicPortfolioOut(BaseModel):
    profile: ProfileOut
    primary_headshot_url: Optional[str] = None
    media_gallery: list[MediaOut] = []
    pdf_resume_url: Optional[str] = None
    credits: dict[str, list[CreditOut]] = {}
