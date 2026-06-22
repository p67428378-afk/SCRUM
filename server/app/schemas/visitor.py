"""
Module: schemas.visitor
Purpose: Pydantic schemas for Visitor
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VisitorPreApprove(BaseModel):
    resident_id: str
    name: str
    expected_arrival: datetime


class VisitorResponse(BaseModel):
    id: str
    resident_id: str
    name: str
    expected_arrival: datetime
    actual_arrival: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
