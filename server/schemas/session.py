from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SessionResponse(BaseModel):
    id: UUID
    channel: str
    device_info: str
    ip_address: str
    location: str | None = None
    is_current: bool
    last_active_at: datetime

    class Config:
        from_attributes = True


class RevokeResponse(BaseModel):
    message: str
