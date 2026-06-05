
import uuid
from pydantic import BaseModel, Field

# Base Pydantic model for Todo
class TodoBase(BaseModel):
    description: str
    completed: bool = False

# Pydantic model for creating a new Todo
class TodoCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=255, description="Description of the todo item. Must be between 1 and 255 characters.")

# Pydantic model for updating a Todo
class TodoUpdate(BaseModel):
    completed: bool

# Pydantic model for representing a Todo in the database
class Todo(TodoBase):
    id: uuid.UUID

    class Config:
        orm_mode = True
