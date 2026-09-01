from datetime import datetime, date
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field


# Auth / User Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[Dict[str, Any]] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "Doctor"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    allergies: Optional[List[str]] = Field(default_factory=list)
    chronic_conditions: Optional[List[str]] = Field(default_factory=list)
    current_medications: Optional[List[str]] = Field(default_factory=list)
    visit_notes: Optional[str] = None


class MedicalRecordUpdate(MedicalRecordBase):
    pass


class MedicalRecordResponse(MedicalRecordBase):
    id: str
    patient_id: str
    updated_by: str
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Patient Schemas
class PatientBase(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    contact_number: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn: Optional[str] = None


class PatientResponse(BaseModel):
    id: str
    patient_code: str
    full_name: str
    date_of_birth: date
    gender: str
    contact_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    medical_record: Optional[MedicalRecordResponse] = None

    class Config:
        from_attributes = True


class PatientListItem(BaseModel):
    id: str
    patient_code: str
    full_name: str
    date_of_birth: date
    gender: str
    contact_number: str
    email: Optional[str] = None
    insurance_info: Optional[Dict[str, Any]] = None
    created_at: datetime
    last_visit: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientSearchResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[PatientListItem]


class DuplicateWarningResponse(BaseModel):
    message: str
    duplicate_found: bool = True
    existing_patient: Optional[Dict[str, Any]] = None


class PHIAuditLogResponse(BaseModel):
    id: str
    user_id: str
    user_role: str
    action: str
    patient_id: Optional[str] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True
