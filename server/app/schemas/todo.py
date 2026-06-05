from pydantic import BaseModel
import uuid

class TodoBase(BaseModel):
    description: str
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    completed: bool

class TodoInDB(TodoBase):
    id: uuid.UUID

    class Config:
        orm_mode = True

class Todo(TodoInDB):
    pass
