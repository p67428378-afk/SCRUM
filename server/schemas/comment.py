from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from server.schemas.user import UserResponse


class CommentBase(BaseModel):
    body: str


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    body: str


class CommentResponse(CommentBase):
    id: str
    task_id: str
    author_id: str
    created_at: datetime
    updated_at: datetime
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
