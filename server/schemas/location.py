
from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal

class LocationBase(BaseModel):
    address: str
    latitude: Decimal
    longitude: Decimal

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    location_id: UUID

    class Config:
        orm_mode = True
