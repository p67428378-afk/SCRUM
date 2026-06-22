"""
Module: schemas.facility
Purpose: Pydantic schemas for Facility and Booking
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class FacilityResponse(BaseModel):
    id: str
    name: str
    description: str
    capacity: int
    rate: Decimal

    class Config:
        from_attributes = True


class AvailabilityResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool


class BookingCreate(BaseModel):
    facility_id: str
    resident_id: str
    start_time: datetime
    end_time: datetime
    purpose: str


class BookingResponse(BaseModel):
    id: str
    facility_id: str
    resident_id: str
    start_time: datetime
    end_time: datetime
    purpose: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
