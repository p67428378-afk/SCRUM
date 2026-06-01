
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
import datetime

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the todo item. Cannot be empty.")
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, description="Title of the todo item. Cannot be empty.")
    completed: Optional[bool] = None

class Todo(TodoBase):
    id: UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True
