from pydantic import BaseModel
from datetime import date, datetime


class BookingBase(BaseModel):
    room_id: str
    guest_name: str
    check_in_date: date
    check_out_date: date


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: str
    status: str
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True
