from datetime import datetime
from typing import Optional, Any, Dict, List
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


class LogEntry(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    level: str = Field("INFO", description="Log level: INFO, WARN, or ERROR")
    message: str = Field(..., description="Log message text")


class TaskCreateRequest(BaseModel):
    action_type: str = Field(
        ...,
        description="Type of long-running action, e.g. report_generation, file_upload, payment_processing",
    )
    payload_name: Optional[str] = Field(
        default=None, description="Optional name/identifier of payload"
    )
    priority: Optional[str] = Field(
        default="normal", description="Optional priority level"
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
    logs: List[LogEntry] = []
    logs_count: int = 0
    error_code: Optional[str] = None
    error_reason: Optional[str] = None

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
    logs: List[LogEntry] = []
    logs_count: int = 0
    result: Optional[Any] = None
    error: Optional[TaskErrorDetail] = None
    error_code: Optional[str] = None
    error_reason: Optional[str] = None

    class Config:
        from_attributes = True


class TaskHistoryItem(BaseModel):
    task_id: str
    action_type: str
    status: str
    error_code: Optional[str] = None
    error_reason: Optional[str] = None
    logs_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskHistoryResponse(BaseModel):
    items: List[TaskHistoryItem]
    total: int


class WebSocketEvent(BaseModel):
    event: str = "TASK_STATUS_UPDATE"  # log_update, status_change, TASK_STATUS_UPDATE
    task_id: str
    status: str
    updated_at: Optional[datetime] = None
    elapsed_seconds: float = 0.0
    is_escalated: bool = False
    escalation_message: Optional[str] = None
    new_log: Optional[LogEntry] = None
    logs: Optional[List[LogEntry]] = None
    result: Optional[Any] = None
    error: Optional[TaskErrorDetail] = None
    error_reason: Optional[str] = None
