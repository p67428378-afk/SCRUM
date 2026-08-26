from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from server.app.schemas.listing import DogListingResponse


class InquiryCreate(BaseModel):
    buyer_name: str
    buyer_email: EmailStr
    buyer_phone: Optional[str] = None
    message: str


class InquiryResponse(InquiryCreate):
    id: str
    listing_id: str
    buyer_id: Optional[str] = None
    created_at: datetime
    listing: Optional[DogListingResponse] = None

    model_config = ConfigDict(from_attributes=True)
