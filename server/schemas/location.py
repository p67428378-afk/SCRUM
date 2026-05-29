
from pydantic import BaseModel
import uuid

class Location(BaseModel):
    location_id: uuid.UUID
    address: str
    city: str
    state: str
    zip_code: str

    class Config:
        orm_mode = True
