from pydantic import BaseModel
from datetime import datetime


class RoomBase(BaseModel):
    room_number: str
    type: str
    capacity: int = 2
    price_per_night: float = 0.00


class RoomCreate(RoomBase):
    pass


class RoomStatusUpdate(BaseModel):
    status: str


class RoomResponse(RoomBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
