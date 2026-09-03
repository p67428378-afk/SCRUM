from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

# -----------------------------
# User Schemas
# -----------------------------


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "owner"  # owner, designer, admin
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# -----------------------------
# Media Asset Schemas
# -----------------------------


class MediaAssetResponse(BaseModel):
    id: str
    post_id: Optional[str] = None
    asset_type: str
    file_name: str
    file_url: str
    file_size_bytes: int
    mime_type: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PresignedUrlRequest(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int = Field(
        ..., le=26214400, description="Max 25MB (26214400 bytes)"
    )
    asset_type: str = Field(
        "mood_board", description="mood_board, floor_plan, or material_spec"
    )

    @field_validator("file_size_bytes")
    @classmethod
    def validate_file_size(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("file_size_bytes must be greater than 0")
        if v > 26214400:
            raise ValueError("File size exceeds maximum permitted limit of 25MB")
        return v

    @field_validator("file_type")
    @classmethod
    def validate_file_type(cls, v: str) -> str:
        allowed_prefixes = ["image/", "application/pdf"]
        if not any(v.startswith(prefix) for prefix in allowed_prefixes):
            raise ValueError(
                f"Content-type '{v}' is not supported. Must be an image or PDF."
            )
        return v


class PresignedUrlResponse(BaseModel):
    upload_url: str
    file_url: str
    asset_type: str
    expires_in_seconds: int = 900


class MediaConfirmRequest(BaseModel):
    post_id: Optional[str] = None
    asset_type: str
    file_name: str
    file_url: str
    file_size_bytes: int
    mime_type: str


# -----------------------------
# Design Post Schemas
# -----------------------------


class DesignPostBase(BaseModel):
    title: str
    description: str
    style: str
    layout_size: str
    budget_tier: str
    color_scheme: Optional[str] = None
    cover_image_url: Optional[str] = None


class DesignPostCreate(DesignPostBase):
    media_asset_ids: Optional[List[str]] = None


class DesignPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    style: Optional[str] = None
    layout_size: Optional[str] = None
    budget_tier: Optional[str] = None
    color_scheme: Optional[str] = None
    cover_image_url: Optional[str] = None


class DesignPostResponse(BaseModel):
    id: str
    designer_id: str
    designer_name: Optional[str] = None
    designer_avatar: Optional[str] = None
    title: str
    description: str
    style: str
    layout_size: str
    budget_tier: str
    color_scheme: Optional[str] = None
    bookmark_count: int = 0
    cover_image_url: Optional[str] = None
    media_assets: List[MediaAssetResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DesignListResponse(BaseModel):
    items: List[DesignPostResponse]
    total: int
    page: int
    limit: int
    total_pages: int


# -----------------------------
# Project Board & Bookmark Schemas
# -----------------------------


class ProjectBoardBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False


class ProjectBoardCreate(ProjectBoardBase):
    pass


class BookmarkCreate(BaseModel):
    post_id: str


class BookmarkResponse(BaseModel):
    id: str
    board_id: str
    post_id: str
    created_at: datetime
    post: Optional[DesignPostResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectBoardResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_private: bool
    bookmark_count: int = 0
    created_at: datetime
    bookmarks: Optional[List[BookmarkResponse]] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Consultation Lead Schemas
# -----------------------------


class LeadCreate(BaseModel):
    designer_id: str
    post_id: Optional[str] = None
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    cafe_location: str
    estimated_budget: str
    project_timeline: str
    message: str

    @field_validator("client_email", "client_phone")
    @classmethod
    def validate_contacts(cls, v, info):
        # Validation happens per field, both email and phone checks pass pydantic
        return v


class LeadStatusUpdate(BaseModel):
    status: str


class LeadResponse(BaseModel):
    id: str
    designer_id: str
    post_id: Optional[str] = None
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    cafe_location: str
    estimated_budget: str
    project_timeline: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
