from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import re

# Password complexity regex: min 12 chars, uppercase, lowercase, number, special char
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$"
)


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone_number: str
    full_name: str
    address: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 12 characters long and include "
                "at least one uppercase letter, one lowercase letter, "
                "one number, and one special character."
            )
        return v


class RegisterResponse(BaseModel):
    id: str
    username: str
    email: str
    phone_number: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginUserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    mfa_required: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: LoginUserResponse


class LogoutResponse(BaseModel):
    detail: str


class MfaSendRequest(BaseModel):
    user_id: str


class MfaSendResponse(BaseModel):
    detail: str


class MfaVerifyRequest(BaseModel):
    user_id: str
    code: str


class MfaVerifyResponse(BaseModel):
    access_token: str
    token_type: str
    user: LoginUserResponse


class AccountResponse(BaseModel):
    id: str
    account_type: str
    account_number_masked: str
    balance: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: str
    amount: Decimal
    category: str
    date: datetime
    description: str
    reference_id: str
    status: str

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]


class ProfileResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    phone_number: str
    address: str
    alert_on_transfer: bool
    alert_on_login: bool
    alert_threshold: Decimal

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    alert_on_transfer: Optional[bool] = None
    alert_on_login: Optional[bool] = None
    alert_threshold: Optional[Decimal] = None


class TransferRequest(BaseModel):
    source_account_ref: str
    destination_account_ref: str
    amount: Decimal = Field(..., gt=0)
    memo: Optional[str] = None


class TransferResponse(BaseModel):
    id: str
    source_account_ref: str
    destination_account_ref: str
    amount: Decimal
    status: str
    core_banking_tx_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserProfileResponse(BaseModel):
    full_name: str
    address: str


class AdminUserAccountResponse(BaseModel):
    id: str
    account_type: str
    account_number_masked: str
    balance: Decimal
    status: str


class AdminUserResponse(BaseModel):
    id: str
    username: str
    email: str
    phone_number: str
    role: str
    is_active: bool
    profile: AdminUserProfileResponse
    accounts: List[AdminUserAccountResponse]

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    event_type: str
    details: Dict[str, Any]
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total: int
    logs: List[AuditLogResponse]
