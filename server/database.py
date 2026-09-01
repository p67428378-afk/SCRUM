import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models import Base as ModelsBase

    ModelsBase.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User, Patient, MedicalRecord
    from server.core.auth import get_password_hash
    from sqlalchemy.exc import IntegrityError
    import uuid
    from datetime import date, datetime

    # Seed Users
    users_to_seed = [
        {
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Dr. Test User",
            "role": "Doctor",
        },
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "Admin User",
            "role": "Admin",
        },
        {
            "email": "nurse@example.com",
            "password": "nursepassword",
            "full_name": "Nurse Joy",
            "role": "Nurse",
        },
        {
            "email": "receptionist@example.com",
            "password": "receptionistpassword",
            "full_name": "Receptionist Rita",
            "role": "Receptionist",
        },
    ]

    for u_data in users_to_seed:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            hashed = get_password_hash(u_data["password"])
            user = User(
                id=str(uuid.uuid4()),
                email=u_data["email"],
                full_name=u_data["full_name"],
                hashed_password=hashed,
                role=u_data["role"],
                is_active=True,
                is_verified=True,
            )
            try:
                db.add(user)
                db.commit()
            except IntegrityError:
                db.rollback()

    # Seed Sample Patient
    existing_patient = db.query(Patient).first()
    if not existing_patient:
        patient_id = str(uuid.uuid4())
        p = Patient(
            id=patient_id,
            patient_code="PAT-1001",
            full_name="John Doe",
            date_of_birth=date(1985, 6, 15),
            gender="Male",
            ssn="XXX-XX-1234",
            contact_number="+1-555-0199",
            email="john.doe@example.com",
            address="123 Health Ave, Suite 100",
            emergency_contact={
                "name": "Jane Doe",
                "phone": "+1-555-0200",
                "relationship": "Spouse",
            },
            insurance_info={"provider": "HealthShield", "policy_number": "INS-99882"},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        try:
            db.add(p)
            db.commit()

            mr = MedicalRecord(
                id=str(uuid.uuid4()),
                patient_id=patient_id,
                allergies=["Penicillin - Severe"],
                chronic_conditions=["Hypertension"],
                current_medications=["Lisinopril 10mg"],
                visit_notes="Patient reported mild dizziness.",
                updated_by="test@example.com",
                version=1,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(mr)
            db.commit()
        except IntegrityError:
            db.rollback()
