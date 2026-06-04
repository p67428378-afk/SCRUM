
from pydantic import BaseModel
from typing import Optional

class TodoBase(BaseModel):
    description: str

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    completed: bool

class Todo(TodoBase):
    id: int
    completed: bool

    class Config:
        orm_mode = True
