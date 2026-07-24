from uuid import UUID

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    channel: str
    device_fingerprint: str


class LoginResponse(BaseModel):
    message: str
    mfa_methods: list[str]
    mfa_session_id: UUID


class MfaVerifyRequest(BaseModel):
    mfa_session_id: UUID
    method: str  # sms, email, totp
    code: str


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    phone_number: str | None = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class MfaResendRequest(BaseModel):
    mfa_session_id: UUID
    method: str  # sms, email


class MfaResendResponse(BaseModel):
    cooldown_seconds: int
    message: str
    remaining_attempts: int


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class LogoutResponse(BaseModel):
    message: str


class StepUpRequest(BaseModel):
    action_type: str  # add_payee, edit_payee, change_contact, large_transfer
    amount: float | None = None
    code: str | None = None
    step_up_session_id: UUID | None = None


class StepUpResponse(BaseModel):
    message: str
    step_up_required: bool
    step_up_session_id: UUID | None = None
