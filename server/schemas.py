from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None


class TodoCreate(TodoBase):
    title: str = Field(
        ..., min_length=1, description="Title is required and cannot be empty"
    )


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    completed: Optional[bool] = None


class TodoResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    isDeleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TodoDeleteResponse(BaseModel):
    id: str
    title: str
    completed: bool
    isDeleted: bool

    class Config:
        from_attributes = True


class PaginatedTodoResponse(BaseModel):
    currentPage: int
    totalPages: int
    totalTodos: int
    todos: List[TodoResponse]
