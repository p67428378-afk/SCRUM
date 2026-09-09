from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ZoneBase(BaseModel):
    zone_code: str
    name: str
    description: Optional[str] = None
    status: Optional[str] = "ACTIVE"


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ZoneResponse(ZoneBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedZonesResponse(BaseModel):
    items: List[ZoneResponse]
    total: int
    skip: int
    limit: int
