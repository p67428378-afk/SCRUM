from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TaskCreateRequest(BaseModel):
    action_type: str = Field(
        ...,
        description="Type of long-running action, e.g. report_generation, file_upload, payment_processing",
    )
    parameters: Optional[Dict[str, Any]] = Field(
        default=None, description="Optional parameters for the task"
    )


class TaskResponse(BaseModel):
    task_id: str
    status: str
    action_type: str
    created_at: datetime
    status_url: str

    class Config:
        from_attributes = True


class TaskErrorDetail(BaseModel):
    code: str
    reason: str


class TaskStatusDetailResponse(BaseModel):
    task_id: str
    status: str
    action_type: str
    created_at: datetime
    updated_at: datetime
    elapsed_seconds: float = 0.0
    is_escalated: bool = False
    escalation_message: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[TaskErrorDetail] = None

    class Config:
        from_attributes = True


class TaskWSMessage(BaseModel):
    event: str = "TASK_STATUS_UPDATE"
    task_id: str
    status: str
    updated_at: datetime
    elapsed_seconds: float = 0.0
    is_escalated: bool = False
    escalation_message: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[TaskErrorDetail] = None
