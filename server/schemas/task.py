from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict, Field


TaskPriority = Literal["Low", "Medium", "High", "Urgent"]
TaskStatus = Literal["To Do", "In Progress", "In Review", "Done"]


class TaskBase(BaseModel):
    summary: str
    description: Optional[str] = None
    priority: TaskPriority = "Medium"
    status: TaskStatus = "To Do"
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    project_id: str


class TaskUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskBulkUpdateRequest(BaseModel):
    task_ids: List[str] = Field(..., min_length=1)
    status: TaskStatus


class TaskBulkUpdateResponse(BaseModel):
    updated_count: int
    tasks: List[TaskResponse]
