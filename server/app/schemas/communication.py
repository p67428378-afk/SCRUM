"""
Module: schemas.communication
Purpose: Pydantic schemas for Announcement, Discussion, and Comment
"""

from datetime import datetime
from pydantic import BaseModel


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class DiscussionResponse(BaseModel):
    id: str
    resident_id: str
    resident_name: str
    title: str
    content: str
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    resident_id: str


class CommentResponse(BaseModel):
    id: str
    discussion_id: str
    resident_id: str
    resident_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
