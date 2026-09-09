from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ServiceRequestBase(BaseModel):
    citizen_id: Optional[str] = None
    zone_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str
    priority: Optional[str] = "MEDIUM"


class ServiceRequestCreate(ServiceRequestBase):
    pass


class ServiceRequestStatusUpdate(BaseModel):
    status: str
    assigned_department: Optional[str] = None
    notes: Optional[str] = None


class ServiceRequestResponse(ServiceRequestBase):
    id: str
    ticket_number: str
    status: str
    assigned_department: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedServiceRequestsResponse(BaseModel):
    items: List[ServiceRequestResponse]
    total: int
    skip: int
    limit: int
