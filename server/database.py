import os
from datetime import date
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/patient_management.db")
TESTING = os.getenv("TESTING", "false").lower() == "true"

if TESTING or DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
        poolclass=StaticPool if ":memory:" in DATABASE_URL or TESTING else None,
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def hash_ssn(ssn: str) -> str:
    """Consistently hash SSN string for duplicate detection."""
    cleaned = ssn.strip().replace("-", "").replace(" ", "")
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()


def get_db():
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the database."""
    # Import models here to ensure they are registered with Base.metadata
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    """Seed initial data idempotently."""
    from server.models import Doctor, Patient, MedicalRecord, Appointment

    # Seed Doctors
    default_doctors = [
        {
            "id": "11111111-1111-4111-8111-111111111111",
            "full_name": "Dr. Sarah Jenkins",
            "specialty": "Cardiology",
            "email": "sarah.jenkins@hospital.org",
        },
        {
            "id": "22222222-2222-4222-8222-222222222222",
            "full_name": "Dr. Robert Chen",
            "specialty": "General Medicine",
            "email": "robert.chen@hospital.org",
        },
        {
            "id": "33333333-3333-4333-8333-333333333333",
            "full_name": "Dr. Emily Taylor",
            "specialty": "Pediatrics",
            "email": "emily.taylor@hospital.org",
        },
        {
            "id": "44444444-4444-4444-8444-444444444444",
            "full_name": "Dr. Marcus Vance",
            "specialty": "Neurology",
            "email": "marcus.vance@hospital.org",
        },
    ]

    for doc in default_doctors:
        existing = db.query(Doctor).filter(Doctor.email == doc["email"]).first()
        if not existing:
            new_doc = Doctor(
                id=doc["id"],
                full_name=doc["full_name"],
                specialty=doc["specialty"],
                email=doc["email"],
            )
            db.add(new_doc)

    try:
        db.commit()
    except Exception:
        db.rollback()

    # Seed sample patient if none exists
    sample_patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    existing_patient = db.query(Patient).filter(Patient.id == sample_patient_id).first()
    if not existing_patient:
        ssn_sample = "999-00-1234"
        ssn_hash = hash_ssn(ssn_sample)
        sample_patient = Patient(
            id=sample_patient_id,
            full_name="Jane Doe",
            dob=date(1990, 5, 15),
            gender="Female",
            phone="+1-555-0199",
            email="jane.doe@example.com",
            emergency_contact="John Doe (+1-555-0198)",
            insurance_provider="HealthShield",
            insurance_policy_number="HS-998822",
            ssn_hash=ssn_hash,
        )
        db.add(sample_patient)
        try:
            db.commit()
        except Exception:
            db.rollback()

        # Add sample medical record
        record_id = "r1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c"
        record = MedicalRecord(
            id=record_id,
            patient_id=sample_patient_id,
            doctor_id="11111111-1111-4111-8111-111111111111",
            allergies="Penicillin, Peanuts",
            current_medications="Lisinopril 10mg, Metformin 500mg",
            clinical_notes="Patient presents with mild hypertension. Blood pressure 135/85. Recommended dietary adjustments and regular cardio exercise.",
        )
        db.add(record)

        # Add sample appointment
        apt_id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
        appointment = Appointment(
            id=apt_id,
            patient_id=sample_patient_id,
            doctor_id="11111111-1111-4111-8111-111111111111",
            appointment_date=date(2026, 9, 15),
            time_slot="10:00 AM - 10:30 AM",
            appointment_type="Routine Checkup",
            status="SCHEDULED",
            notes="Annual cardiovascular health assessment",
        )
        db.add(appointment)

        try:
            db.commit()
        except Exception:
            db.rollback()
