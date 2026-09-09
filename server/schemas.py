from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# Credit Schemas
class CreditBase(BaseModel):
    category: str
    production_title: str
    role_name: str
    role_type: Optional[str] = None
    director: Optional[str] = None
    release_year: Optional[int] = None
    notes: Optional[str] = None


class CreditResponse(CreditBase):
    id: str

    class Config:
        from_attributes = True


class CreditListResponse(BaseModel):
    total: int
    credits: List[CreditResponse]


# MediaAsset Schemas
class MediaAssetBase(BaseModel):
    title: str
    media_type: str
    thumbnail_url: Optional[str] = None
    full_url: Optional[str] = None
    download_url: Optional[str] = None
    embed_code: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0


class MediaAssetResponse(MediaAssetBase):
    id: str

    class Config:
        from_attributes = True


class MediaAssetListResponse(BaseModel):
    total: int
    assets: List[MediaAssetResponse]


# ContactInquiry Schemas
class ContactInquiryCreate(BaseModel):
    sender_name: str = Field(..., min_length=1, description="Sender's full name")
    sender_email: EmailStr = Field(..., description="Valid sender email address")
    project_type: str = Field(
        ..., min_length=1, description="Type of project (e.g. Film, TV)"
    )
    budget: Optional[str] = None
    project_dates: Optional[str] = None
    message: str = Field(
        ..., min_length=1, description="Inquiry message / character breakdown"
    )


class ContactInquiryResponse(BaseModel):
    status: str = "success"
    inquiry_id: str
    message: str
    submitted_at: datetime
