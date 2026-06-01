from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1)
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: str | None = Field(None, min_length=1)
    completed: bool | None = None


class Todo(TodoBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True