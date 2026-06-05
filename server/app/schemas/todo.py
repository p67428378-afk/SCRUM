from pydantic import BaseModel
import uuid

class TodoBase(BaseModel):
    description: str
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    completed: bool

class Todo(TodoBase):
    id: str

    class Config:
        orm_mode = True
