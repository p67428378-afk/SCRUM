
import uuid
from pydantic import BaseModel

# Shared properties
class TodoBase(BaseModel):
    description: str

# Properties to receive on item creation
class TodoCreate(TodoBase):
    pass

# Properties to receive on item update
class TodoUpdate(BaseModel):
    completed: bool

# Properties shared by models stored in DB
class TodoInDBBase(TodoBase):
    id: uuid.UUID
    completed: bool

    class Config:
        from_attributes = True

# Properties to return to client
class Todo(TodoInDBBase):
    pass

# Properties stored in DB
class TodoInDB(TodoInDBBase):
    pass
