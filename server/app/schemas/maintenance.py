"""
Module: schemas.maintenance
Purpose: Pydantic schemas for MaintenanceRequest
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MaintenanceRequestCreate(BaseModel):
    category: str
    description: str
    priority: str
    resident_id: str
    image_url: Optional[str] = None


class MaintenanceRequestResponse(BaseModel):
    id: str
    resident_id: str
    category: str
    description: str
    priority: str
    status: str
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
