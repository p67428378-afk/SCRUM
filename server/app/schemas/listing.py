from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from server.app.schemas.user import UserResponse


class DogListingBase(BaseModel):
    title: str
    breed: str
    age_months: int
    price: float
    location: str
    description: str
    health_records: Optional[str] = None
    photo_urls: Optional[List[str]] = Field(default_factory=list)
    status: Optional[str] = "available"


class DogListingCreate(DogListingBase):
    pass


class DogListingUpdate(BaseModel):
    title: Optional[str] = None
    breed: Optional[str] = None
    age_months: Optional[int] = None
    price: Optional[float] = None
    location: Optional[str] = None
    description: Optional[str] = None
    health_records: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    status: Optional[str] = None


class DogListingResponse(DogListingBase):
    id: str
    seller_id: str
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
