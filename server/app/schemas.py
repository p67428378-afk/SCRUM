import json
from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "buyer"  # buyer, seller_agent, admin
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# --- Amenity Schemas ---
class AmenityBase(BaseModel):
    name: str


class AmenityResponse(AmenityBase):
    id: str

    class Config:
        from_attributes = True


# --- Property Image Schemas ---
class PropertyImageBase(BaseModel):
    image_url: str
    display_order: int = 0


class PropertyImageCreate(PropertyImageBase):
    pass


class PropertyImageResponse(PropertyImageBase):
    id: str
    property_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Property Schemas ---
class PropertyBase(BaseModel):
    title: str
    description: str
    property_type: str  # single_family, condo, townhouse
    status: str = "Active"  # Active, Pending, Sold
    price: float
    bedrooms: int
    bathrooms: float
    square_feet: int
    address_street: str
    city: str
    state: str
    zip_code: str
    latitude: float = 0.0
    longitude: float = 0.0


class PropertyCreate(PropertyBase):
    amenities: Optional[List[str]] = []  # List of amenity names or IDs
    images: Optional[List[str]] = []  # List of image URLs


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[int] = None
    address_street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None


class PropertyResponse(PropertyBase):
    id: str
    owner_agent_id: str
    created_at: datetime
    updated_at: datetime
    owner_agent: Optional[UserResponse] = None
    images: List[PropertyImageResponse] = []
    amenities: List[AmenityResponse] = []
    is_favorite: Optional[bool] = False

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    skip: int
    limit: int


# --- Favorite Schemas ---
class FavoriteCreate(BaseModel):
    property_id: str


class FavoriteResponse(BaseModel):
    user_id: str
    property_id: str
    created_at: datetime
    property: Optional[PropertyResponse] = None

    class Config:
        from_attributes = True


# --- Saved Search Schemas ---
class SavedSearchBase(BaseModel):
    name: str
    filter_criteria: Dict[str, Any]


class SavedSearchCreate(SavedSearchBase):
    pass


class SavedSearchResponse(BaseModel):
    id: str
    user_id: str
    name: str
    filter_criteria: Dict[str, Any]
    created_at: datetime

    @field_validator("filter_criteria", mode="before")
    def parse_filter_criteria(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v

    class Config:
        from_attributes = True
