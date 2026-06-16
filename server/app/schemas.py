"""
Module: schemas
Purpose: Pydantic schemas for request/response validation.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class KYCOnboardingRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=1, max_length=50)
    cibil_consent: bool
    aadhaar_number: str = Field(..., min_length=12, max_length=12, pattern=r"^\d{12}$")
    pan_number: str = Field(..., min_length=10, max_length=10, pattern=r"^[A-Z]{5}\d{4}[A-Z]$")


class KYCOnboardingResponse(BaseModel):
    id: str
    customer_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KYCRequestListItem(BaseModel):
    id: str
    customer_name: str
    aadhaar_status: str
    pan_status: str
    rbi_status: str
    cibil_status: str
    final_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerDetail(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    aadhaar_number: str
    pan_number: str

    class Config:
        from_attributes = True


class VerificationDetail(BaseModel):
    id: str
    aadhaar_status: str
    aadhaar_response: Optional[Dict[str, Any]] = None
    pan_status: str
    pan_response: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ScreeningDetail(BaseModel):
    id: str
    rbi_status: str
    rbi_response: Optional[Dict[str, Any]] = None
    cibil_status: str
    cibil_response: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class AuditLogDetail(BaseModel):
    id: str
    action: str
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True


class KYCRequestDetail(BaseModel):
    id: str
    status: str
    customer: CustomerDetail
    verification: Optional[VerificationDetail] = None
    screening: Optional[ScreeningDetail] = None
    audit_logs: List[AuditLogDetail] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
