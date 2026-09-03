from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


# ==========================================
# User & Auth Schemas
# ==========================================


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=6, description="Password must be at least 6 characters"
    )
    full_name: str = Field(..., min_length=1, description="Full name or studio name")
    role: str = Field("cafe_owner", description="Role: 'cafe_owner' or 'designer'")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"cafe_owner", "designer", "admin"}
        if v.lower() not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v.lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ==========================================
# Media Asset Schemas
# ==========================================


class PresignedUrlRequest(BaseModel):
    filename: str = Field(..., min_length=1)
    file_type: str = Field(
        ..., description="MIME type e.g. image/jpeg, application/pdf"
    )
    file_size_bytes: int = Field(..., gt=0, description="File size in bytes (max 25MB)")
    asset_type: str = Field(
        ..., description="Type of asset: 'mood_board', 'floor_plan', 'material_spec'"
    )

    @field_validator("asset_type")
    @classmethod
    def validate_asset_type(cls, v: str) -> str:
        allowed = {"mood_board", "floor_plan", "material_spec"}
        if v.lower() not in allowed:
            raise ValueError(f"asset_type must be one of {allowed}")
        return v.lower()


class PresignedUrlResponse(BaseModel):
    upload_url: str
    media_asset_id: str
    key: str
    file_url: str
    expires_in: int
    asset_type: str


class MediaConfirmRequest(BaseModel):
    media_asset_id: str
    post_id: Optional[str] = None


class MediaAssetOut(BaseModel):
    id: str
    post_id: Optional[str] = None
    asset_type: str
    filename: str
    file_url: str
    file_type: str
    file_size_bytes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Design Post Schemas
# ==========================================


class DesignPostCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    style: str = Field(
        ...,
        description="Style e.g. Industrial, Minimalist, Vintage, Modern, Rustic, Scandinavian",
    )
    layout_size: str = Field(
        ..., description="Spatial layout e.g. Small (< 500 sq ft), Medium, Large"
    )
    budget_tier: str = Field(
        ..., description="Budget tier e.g. Budget ($), Mid-Range ($$), Premium, Luxury"
    )
    color_scheme: Optional[str] = Field(
        None, description="Color scheme e.g. Emerald & Brass, Warm Earth"
    )
    cover_image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    media_asset_ids: Optional[List[str]] = Field(
        default_factory=list, description="IDs of previously requested media assets"
    )


class DesignPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    style: Optional[str] = None
    layout_size: Optional[str] = None
    budget_tier: Optional[str] = None
    color_scheme: Optional[str] = None
    cover_image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None


class DesignPostOut(BaseModel):
    id: str
    designer_id: str
    designer_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    style: str
    layout_size: str
    budget_tier: str
    color_scheme: Optional[str] = None
    cover_image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    bookmark_count: int = 0
    media_assets: List[MediaAssetOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DesignListResponse(BaseModel):
    items: List[DesignPostOut]
    total: int
    skip: int
    limit: int


# ==========================================
# Project Board & Bookmark Schemas
# ==========================================


class ProjectBoardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_private: bool = False


class ProjectBoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None


class BookmarkCreate(BaseModel):
    post_id: str


class BookmarkOut(BaseModel):
    id: str
    board_id: str
    post_id: str
    post: Optional[DesignPostOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBoardOut(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_private: bool
    bookmark_count: int = 0
    bookmarks: Optional[List[BookmarkOut]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBoardListResponse(BaseModel):
    items: List[ProjectBoardOut]
    total: int


# ==========================================
# Consultation Lead Schemas
# ==========================================


class LeadCreate(BaseModel):
    designer_id: str
    post_id: Optional[str] = None
    client_name: str = Field(..., min_length=1)
    client_email: Optional[EmailStr] = None
    client_phone: Optional[str] = None
    cafe_location: str = Field(..., min_length=1)
    estimated_budget: str = Field(..., min_length=1)
    project_timeline: str = Field(..., min_length=1)
    message: str = Field(..., min_length=5)


class LeadStatusUpdate(BaseModel):
    status: str = Field(
        ..., description="Status: 'new', 'in_review', 'contacted', 'closed'"
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"new", "in_review", "contacted", "closed"}
        if v.lower() not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v.lower()


class LeadOut(BaseModel):
    id: str
    designer_id: str
    post_id: Optional[str] = None
    post_title: Optional[str] = None
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    cafe_location: str
    estimated_budget: str
    project_timeline: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    items: List[LeadOut]
    total: int
    skip: int
    limit: int
