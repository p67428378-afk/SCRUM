from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class EmergencyContact(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None


class InsuranceInfo(BaseModel):
    provider: Optional[str] = None
    policy_number: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Doctor"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class PatientCreate(BaseModel):
    full_name: str
    date_of_birth: str
    gender: str
    contact_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn: Optional[str] = None


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn: Optional[str] = None


class MedicalHistoryUpdate(BaseModel):
    allergies: Optional[List[str]] = Field(default_factory=list)
    chronic_conditions: Optional[List[str]] = Field(default_factory=list)
    current_medications: Optional[List[str]] = Field(default_factory=list)
    visit_notes: Optional[str] = None


class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []
    visit_notes: Optional[str] = None
    updated_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientResponse(BaseModel):
    id: str
    patient_code: str
    full_name: str
    date_of_birth: str
    gender: str
    contact_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None
    ssn_masked: Optional[str] = None
    medical_record: Optional[MedicalRecordResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientSearchResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[PatientResponse]
