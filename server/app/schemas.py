from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PropertyPriceHistoryResponse(BaseModel):
    id: str
    property_id: str
    price: float
    change_event: str
    recorded_at: datetime

    class Config:
        from_attributes = True


class PriceHistoryListResponse(BaseModel):
    property_id: str
    history: List[PropertyPriceHistoryResponse]


class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    city: str
    zip_code: str
    address: Optional[str] = None
    sqft: int = Field(..., gt=0)
    bedrooms: int = Field(1, ge=0)
    bathrooms: float = Field(1.0, ge=0)
    status: str = "Active"


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    city: Optional[str] = None
    zip_code: Optional[str] = None
    address: Optional[str] = None
    sqft: Optional[int] = Field(None, gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None


class PropertyResponse(PropertyBase):
    id: str
    created_at: datetime
    updated_at: datetime
    price_history: List[PropertyPriceHistoryResponse] = []

    class Config:
        from_attributes = True


class PriceTrendPoint(BaseModel):
    month: str
    avg_price_per_sqft: float


class CmaAnalyticsResponse(BaseModel):
    location: str
    insufficient_data: bool
    median_price_per_sqft: float
    average_days_on_market: float
    price_trend_points: List[PriceTrendPoint]
