
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class TodoBase(BaseModel):
    title: str
    completed: bool = False

class TodoCreate(BaseModel):
    title: str

class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

class Todo(TodoBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
