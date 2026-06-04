
import uuid
from pydantic import BaseModel
from datetime import datetime

class AnnouncementBase(BaseModel):
    title: str
    summary: str | None = None
    content: str
    publication_date: datetime
    author: str
    category: str | None = None

class AnnouncementCreate(AnnouncementBase):
    pass

class Announcement(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AnnouncementSummary(BaseModel):
    id: uuid.UUID
    title: str
    summary: str | None = None
    publication_date: datetime
    author: str
    category: str | None = None

    class Config:
        orm_mode = True

class EventBase(BaseModel):
    title: str
    description: str
    event_date: datetime
    location: str
    category: str | None = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
