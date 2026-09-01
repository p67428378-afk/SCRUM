import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    """Generate a UUID v4 string."""
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


class Patient(Base):
    """Patient entity storing personal and demographic details."""

    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    full_name = Column(String(255), nullable=False, index=True)
    dob = Column(Date, nullable=False)
    gender = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    emergency_contact = Column(String(255), nullable=False)
    insurance_provider = Column(String(255), nullable=True)
    insurance_policy_number = Column(String(100), nullable=True)
    ssn_hash = Column(String(255), nullable=True, unique=True, index=True)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    records = relationship(
        "MedicalRecord", back_populates="patient", cascade="all, delete-orphan"
    )
    appointments = relationship(
        "Appointment", back_populates="patient", cascade="all, delete-orphan"
    )


class Doctor(Base):
    """Doctor/Healthcare Provider entity."""

    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    full_name = Column(String(255), nullable=False)
    specialty = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    records = relationship("MedicalRecord", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")


class MedicalRecord(Base):
    """Clinical consultation notes and patient medical history records."""

    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    patient_id = Column(
        String(36),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_id = Column(
        String(36),
        ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    patient = relationship("Patient", back_populates="records")
    doctor = relationship("Doctor", back_populates="records")


class Appointment(Base):
    """Scheduled appointments between Patients and Doctors."""

    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    patient_id = Column(
        String(36),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_id = Column(
        String(36),
        ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    appointment_date = Column(Date, nullable=False, index=True)
    time_slot = Column(String(50), nullable=False)
    appointment_type = Column(String(100), nullable=False)
    status = Column(
        String(50), nullable=False, default="SCHEDULED"
    )  # SCHEDULED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
