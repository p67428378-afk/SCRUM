from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    mfa_code: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    mfa_required: bool


class LogoutResponse(BaseModel):
    message: str


# Profile schemas
class ProfileResponse(BaseModel):
    student_id: UUID
    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    email: EmailStr
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    phone_number: Optional[str] = None
    preferred_name: Optional[str] = None
    profile_picture_url: Optional[str] = None


# Academics schemas
class EnrolledCourse(BaseModel):
    course_code: str
    course_name: str
    instructor: str
    grade: Optional[str] = None
    progress: int


class UpcomingDeadline(BaseModel):
    id: str
    title: str
    due_date: datetime
    status: str


class AcademicProgressResponse(BaseModel):
    gpa: float
    completed_credits: int
    enrolled_courses: List[EnrolledCourse]
    upcoming_deadlines: List[UpcomingDeadline]
