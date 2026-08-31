from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CommentBase(BaseModel):
    body: str


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    body: str


class CommentAuthor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    author_id: str
    body: str
    author: Optional[CommentAuthor] = None
    created_at: datetime
    updated_at: datetime
