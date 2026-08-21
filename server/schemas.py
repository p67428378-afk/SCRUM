from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRole(str, Enum):
    buyer = "buyer"
    seller = "seller"


class CatStatus(str, Enum):
    Available = "Available"
    Sold = "Sold"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.buyer


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# Cat Schemas
class CatBase(BaseModel):
    name: str
    breed: str
    age_months: int = Field(..., ge=0)
    gender: str
    price: float = Field(..., gt=0)
    description: str
    image_url: Optional[str] = None


class CatCreate(CatBase):
    pass


class CatUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    age_months: Optional[int] = Field(None, ge=0)
    gender: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[CatStatus] = None


class CatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    seller_id: str
    name: str
    breed: str
    age_months: int
    gender: str
    price: float
    description: str
    image_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class CatDetailResponse(CatResponse):
    model_config = ConfigDict(from_attributes=True)
    seller: UserResponse


class CatListResponse(BaseModel):
    items: List[CatResponse]
    total: int
    skip: int
    limit: int


# Inquiry Schemas
class InquiryBase(BaseModel):
    buyer_name: str
    buyer_email: EmailStr
    buyer_phone: Optional[str] = None
    message: str


class InquiryCreate(InquiryBase):
    pass


class InquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    cat_id: str
    buyer_id: Optional[str] = None
    buyer_name: str
    buyer_email: EmailStr
    buyer_phone: Optional[str] = None
    message: str
    created_at: datetime


class InquiryDetailResponse(InquiryResponse):
    model_config = ConfigDict(from_attributes=True)
    cat: CatResponse
