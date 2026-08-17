from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str


class UserCreate(UserBase):
    password: str
    manager_id: Optional[str] = None


class UserResponse(UserBase):
    id: str
    manager_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# Attendance Schemas
class AttendanceEventResponse(BaseModel):
    id: str
    user_id: str
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Adjustment Request Schemas
class AdjustmentRequestCreate(BaseModel):
    requested_check_in: Optional[datetime] = None
    requested_check_out: Optional[datetime] = None
    reason: str


class AdjustmentRequestUpdate(BaseModel):
    status: str  # Approved, Rejected


class AdjustmentRequestResponse(BaseModel):
    id: str
    user_id: str
    approver_id: Optional[str] = None
    requested_check_in: Optional[datetime] = None
    requested_check_out: Optional[datetime] = None
    reason: str
    status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    editor_id: str
    event_id: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True
