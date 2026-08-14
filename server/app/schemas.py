from pydantic import BaseModel, Field, field_validator
import re
from typing import Optional, List
from datetime import datetime


class AlertRegisterRequest(BaseModel):
    alertDeliveryChannel: str = Field(..., description="Delivery channel, e.g., SMS")
    cardNumber: str = Field(..., description="16-digit debit card number")
    dailySpendThreshold: float = Field(..., description="Fixed daily spend threshold")
    mobileNumber: str = Field(..., description="Registered mobile number")

    @field_validator("cardNumber")
    def validate_card_number(cls, v):
        # Remove spaces or hyphens
        cleaned = re.sub(r"[\s-]", "", v)
        if not cleaned.isdigit() or len(cleaned) != 16:
            raise ValueError("Card number must be exactly 16 digits")
        return cleaned

    @field_validator("mobileNumber")
    def validate_mobile_number(cls, v):
        # Simple mobile number validation (starts with + or is 10-15 digits)
        cleaned = re.sub(r"[\s-]", "", v)
        if not re.match(r"^\+?[1-9]\d{1,14}$", cleaned):
            raise ValueError("Invalid mobile number format")
        return cleaned


class AlertRegisterResponse(BaseModel):
    otpReferenceId: str
    status: str


class OTPSendRequest(BaseModel):
    mobileNumber: str
    transactionType: str

    @field_validator("mobileNumber")
    def validate_mobile_number(cls, v):
        cleaned = re.sub(r"[\s-]", "", v)
        if not re.match(r"^\+?[1-9]\d{1,14}$", cleaned):
            raise ValueError("Invalid mobile number format")
        return cleaned


class OTPSendResponse(BaseModel):
    otpReferenceId: str
    status: str


class OTPVerifyRequest(BaseModel):
    alertDeliveryChannel: str
    cardNumber: str
    dailySpendThreshold: float
    mobileNumber: str
    otpCode: str
    otpReferenceId: str

    @field_validator("cardNumber")
    def validate_card_number(cls, v):
        cleaned = re.sub(r"[\s-]", "", v)
        if not cleaned.isdigit() or len(cleaned) != 16:
            raise ValueError("Card number must be exactly 16 digits")
        return cleaned

    @field_validator("mobileNumber")
    def validate_mobile_number(cls, v):
        cleaned = re.sub(r"[\s-]", "", v)
        if not re.match(r"^\+?[1-9]\d{1,14}$", cleaned):
            raise ValueError("Invalid mobile number format")
        return cleaned

    @field_validator("otpCode")
    def validate_otp_code(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP code must be exactly 6 digits")
        return v


class OTPVerifyResponse(BaseModel):
    alertDeliveryChannel: str
    cardIdentifier: str
    dailySpendThreshold: float
    status: str


class AlertRuleResponse(BaseModel):
    alert_delivery_channel: str
    card_identifier: str
    current_daily_spend: float
    daily_spend_threshold: float
    status: str

    class Config:
        from_attributes = True


class SimulateSpendRequest(BaseModel):
    cardNumber: str
    amount: float

    @field_validator("cardNumber")
    def validate_card_number(cls, v):
        cleaned = re.sub(r"[\s-]", "", v)
        if not cleaned.isdigit() or len(cleaned) != 16:
            raise ValueError("Card number must be exactly 16 digits")
        return cleaned


class SimulateSpendResponse(BaseModel):
    status: str
    breached: bool
    sms_sent: bool
    message: str


# --- Secure Employee Account Management Schemas ---


class PermissionBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class RoleWithPermissions(RoleBase):
    permissions: List[PermissionBase] = []


class UserCreateRequest(BaseModel):
    email: str
    employee_id: str
    first_name: str
    last_name: str
    status: Optional[str] = "ACTIVE"


class UserUpdateRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    status: str


class UserResponse(BaseModel):
    id: str
    employee_id: str
    first_name: str
    last_name: str
    email: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    roles: List[RoleBase] = []
    permissions: List[PermissionBase] = []


class UserDeactivateResponse(BaseModel):
    message: str


class RoleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None


class UserRolesUpdateRequest(BaseModel):
    role_ids: List[str]


class UserRolesUpdateResponse(BaseModel):
    user_id: str
    roles: List[RoleBase]


class UserPermissionsUpdateRequest(BaseModel):
    permission_ids: List[str]


class UserPermissionsUpdateResponse(BaseModel):
    user_id: str
    permissions: List[PermissionBase]


class RolePermissionsUpdateRequest(BaseModel):
    permission_ids: List[str]


class RolePermissionsUpdateResponse(BaseModel):
    role_id: str
    permissions: List[PermissionBase]


class DashboardUserItem(BaseModel):
    id: str
    employee_id: str
    first_name: str
    last_name: str
    email: str
    status: str
    created_at: datetime
    roles: List[str]

    class Config:
        from_attributes = True


class DashboardUsersResponse(BaseModel):
    total: int
    users: List[DashboardUserItem]


class DashboardRoleItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[str]

    class Config:
        from_attributes = True


class DashboardRolesResponse(BaseModel):
    total: int
    roles: List[DashboardRoleItem]


class AuditLogItem(BaseModel):
    id: str
    action_type: str
    actor_id: Optional[str] = None
    target_id: Optional[str] = None
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True


class DashboardAuditLogsResponse(BaseModel):
    total: int
    logs: List[AuditLogItem]
