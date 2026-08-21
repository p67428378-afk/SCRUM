from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRole(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"


class CatStatus(str, Enum):
    AVAILABLE = "Available"
    SOLD = "Sold"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "buyer"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
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


class CatResponse(CatBase):
    id: str
    seller_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CatDetailResponse(CatBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    seller: UserResponse

    model_config = ConfigDict(from_attributes=True)


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


class InquiryResponse(InquiryBase):
    id: str
    cat_id: str
    buyer_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InquiryDetailResponse(InquiryBase):
    id: str
    cat_id: str
    buyer_id: Optional[str] = None
    created_at: datetime
    cat: CatResponse

    model_config = ConfigDict(from_attributes=True)
