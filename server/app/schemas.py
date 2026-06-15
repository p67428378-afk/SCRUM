from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class TaskCreate(BaseModel):
    content: str

class TaskUpdate(BaseModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: str
    content: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
