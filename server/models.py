import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Date,
    Integer,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        String(50), default="Doctor", nullable=False
    )  # Admin, Doctor, Nurse, Receptionist
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_code = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(255), index=True, nullable=False)
    date_of_birth = Column(Date, index=True, nullable=False)
    gender = Column(String(20), nullable=False)
    ssn = Column(String(50), nullable=True, index=True)
    contact_number = Column(String(50), index=True, nullable=False)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(JSON, nullable=True)
    insurance_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
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
        String(36), ForeignKey("patients.id"), unique=True, index=True, nullable=False
    )
    allergies = Column(JSON, default=list, nullable=True)
    chronic_conditions = Column(JSON, default=list, nullable=True)
    current_medications = Column(JSON, default=list, nullable=True)
    visit_notes = Column(Text, nullable=True)
    updated_by = Column(String(255), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    patient = relationship("Patient", back_populates="medical_record")


class PHIAuditLog(Base):
    __tablename__ = "phi_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(255), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)  # CREATE, READ, UPDATE, SEARCH
    patient_id = Column(String(36), nullable=True, index=True)
    ip_address = Column(String(45), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
