from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict


class TenantCreate(BaseModel):
    name: str
    slug: str
    domain: Optional[str] = None
    admin_email: Optional[EmailStr] = None
    admin_full_name: Optional[str] = None
    admin_password: Optional[str] = None
    rate_limit_rpm: Optional[int] = 1000
    storage_quota_gb: Optional[int] = 50


class TenantUpdateStatus(BaseModel):
    status: str  # Active, Suspended, Deactivated


class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    domain: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserInvite(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "User"


class UserMembershipResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    role: str
    status: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenantConfigUpdate(BaseModel):
    rate_limit_rpm: Optional[int] = None
    storage_quota_gb: Optional[int] = None
    feature_flags: Optional[Dict[str, Any]] = None


class TenantConfigResponse(BaseModel):
    id: str
    tenant_id: str
    rate_limit_rpm: int
    storage_quota_gb: int
    feature_flags: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class AuditLogResponse(BaseModel):
    id: str
    tenant_id: str
    actor_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
