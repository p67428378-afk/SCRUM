from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, description="The title of the to-do item.")
    description: Optional[str] = Field(
        None, description="A detailed description of the to-do item."
    )
    due_date: Optional[datetime] = Field(
        None, description="The date and time the to-do item is due."
    )
    priority: str = Field(
        "Medium",
        description="The priority of the to-do item (e.g., 'High', 'Medium', 'Low').",
    )

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"High", "Medium", "Low"}
        if v not in allowed:
            raise ValueError("Priority must be one of 'High', 'Medium', 'Low'")
        return v

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TodoCreate(TodoBase):
    pass


class TodoUpdate(TodoBase):
    pass


class TodoResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
