
from pydantic import BaseModel, validator
from uuid import UUID
from decimal import Decimal
from typing import List
import json

class CarBase(BaseModel):
    make: str
    model: str
    year: int
    daily_rate: Decimal
    status: str
    image_urls: List[str]

    @validator('image_urls', pre=True, allow_reuse=True)
    def convert_image_urls(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v

class Car(CarBase):
    car_id: UUID

    class Config:
        orm_mode = True

class CarDetails(Car):
    vin: str
    license_plate: str
    description: str
    current_location_id: UUID

    class Config:
        orm_mode = True
