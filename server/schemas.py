from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ----------------------------------------
# Doctor Schemas
# ----------------------------------------
class DoctorBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    specialty: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    specialty: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=3, max_length=255)


class Doctor(DoctorBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Patient Schemas
# ----------------------------------------
class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    dob: date
    gender: str = Field(..., min_length=1, max_length=50)
    phone: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    emergency_contact: str = Field(..., min_length=1, max_length=255)
    insurance_provider: Optional[str] = Field(None, max_length=255)
    insurance_policy_number: Optional[str] = Field(None, max_length=100)


class PatientCreate(PatientBase):
    ssn: Optional[str] = Field(None, max_length=50)


class PatientUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    dob: Optional[date] = None
    gender: Optional[str] = Field(None, min_length=1, max_length=50)
    phone: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    emergency_contact: Optional[str] = Field(None, min_length=1, max_length=255)
    insurance_provider: Optional[str] = Field(None, max_length=255)
    insurance_policy_number: Optional[str] = Field(None, max_length=100)


class Patient(PatientBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Medical Record Schemas
# ----------------------------------------
class MedicalRecordBase(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    clinical_notes: str = Field(..., min_length=1)


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecord(MedicalRecordBase):
    id: str
    created_at: datetime
    updated_at: datetime
    doctor: Optional[Doctor] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Appointment Schemas
# ----------------------------------------
class AppointmentBase(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: date
    time_slot: str = Field(..., min_length=1, max_length=50)
    appointment_type: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    time_slot: Optional[str] = Field(None, min_length=1, max_length=50)
    appointment_type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, pattern="^(SCHEDULED|COMPLETED|CANCELLED)$")
    notes: Optional[str] = None


class Appointment(AppointmentBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    patient: Optional[Patient] = None
    doctor: Optional[Doctor] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Generic / Health Schemas
# ----------------------------------------
class HealthStatus(BaseModel):
    status: str
    database: str
