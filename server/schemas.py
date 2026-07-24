from pydantic import BaseModel, field_validator
from typing import Optional
import re


class RegisterRequest(BaseModel):
    account_number: str
    password: str
    ssn: str
    username: str
    security_question: Optional[str] = None
    security_answer: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class RegisterResponse(BaseModel):
    message: str
    user_id: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    mfa_required: bool
    user_id: str


class VerifyMFARequest(BaseModel):
    code: str
    user_id: str


class UserSessionInfo(BaseModel):
    customer_id: str
    id: str
    username: str


class VerifyMFAResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserSessionInfo


class LogoutResponse(BaseModel):
    message: str


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str


class RecoverInitiateRequest(BaseModel):
    username: str
    security_answer: Optional[str] = None


class RecoverInitiateResponse(BaseModel):
    message: str
    username: str


class RecoverCompleteRequest(BaseModel):
    email_code: str
    new_password: str
    username: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class RecoverCompleteResponse(BaseModel):
    message: str


class SessionResponse(BaseModel):
    customer_id: str
    id: str
    last_login_at: Optional[str] = None
    username: str
