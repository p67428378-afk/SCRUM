from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1)
    completed: bool = False

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1)

class TodoUpdate(BaseModel):
    title: str | None = Field(None, min_length=1)
    completed: bool | None = None

class Todo(BaseModel):
    id: uuid.UUID
    title: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
