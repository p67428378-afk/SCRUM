
from pydantic import BaseModel
from typing import List, Optional
import uuid

class CarAvailability(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]

    class Config:
        orm_mode = True

class CarDetails(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]
    description: Optional[str]
    vin: str
    license_plate: str
    current_location_id: uuid.UUID

    class Config:
        orm_mode = True
