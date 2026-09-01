import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        String(50), nullable=False, default="Doctor"
    )  # Admin, Doctor, Nurse, Receptionist
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_code = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False, index=True)
    date_of_birth = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    gender = Column(String(20), nullable=False)
    contact_number = Column(String(50), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    ssn = Column(String(20), nullable=True)
    emergency_contact = Column(JSON, nullable=True)
    insurance_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    medical_record = relationship(
        "MedicalRecord",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan",
    )


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(
        String(36), ForeignKey("patients.id"), nullable=False, unique=True
    )
    allergies = Column(JSON, nullable=True, default=list)
    chronic_conditions = Column(JSON, nullable=True, default=list)
    current_medications = Column(JSON, nullable=True, default=list)
    visit_notes = Column(Text, nullable=True)
    updated_by = Column(String(100), nullable=False, default="System")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = relationship("Patient", back_populates="medical_record")


class PHIAuditLog(Base):
    __tablename__ = "phi_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(100), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)  # CREATE, READ, UPDATE, SEARCH, DELETE
    patient_id = Column(String(36), nullable=True)
    ip_address = Column(String(45), nullable=False, default="127.0.0.1")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
