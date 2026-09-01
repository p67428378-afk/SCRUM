import uuid
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from server import models, schemas
from server.services.audit_service import log_phi_access


def mask_ssn(ssn: Optional[str]) -> Optional[str]:
    if not ssn:
        return None
    clean = ssn.replace("-", "").replace(" ", "")
    if len(clean) >= 4:
        return f"XXX-XX-{clean[-4:]}"
    return "XXX-XX-XXXX"


def generate_patient_code(db: Session) -> str:
    count = db.query(models.Patient).count()
    return f"PAT-{1001 + count}"


def check_duplicate_patient(
    db: Session, ssn: Optional[str], full_name: str, dob: str
) -> Optional[models.Patient]:
    if ssn:
        clean_ssn = ssn.strip()
        existing = (
            db.query(models.Patient).filter(models.Patient.ssn == clean_ssn).first()
        )
        if existing:
            return existing
    existing_name_dob = (
        db.query(models.Patient)
        .filter(
            and_(
                models.Patient.full_name == full_name.strip(),
                models.Patient.date_of_birth == dob.strip(),
            )
        )
        .first()
    )
    return existing_name_dob


def create_patient(
    db: Session, patient_in: schemas.PatientCreate, current_user: models.User
) -> Tuple[models.Patient, bool]:
    duplicate = check_duplicate_patient(
        db, patient_in.ssn, patient_in.full_name, patient_in.date_of_birth
    )
    is_duplicate = duplicate is not None

    patient_code = generate_patient_code(db)
    patient = models.Patient(
        id=str(uuid.uuid4()),
        patient_code=patient_code,
        full_name=patient_in.full_name,
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        contact_number=patient_in.contact_number,
        email=patient_in.email,
        address=patient_in.address,
        ssn=patient_in.ssn,
        emergency_contact=patient_in.emergency_contact,
        insurance_info=patient_in.insurance_info,
    )
    db.add(patient)
    db.flush()

    # Create empty medical record
    medical_rec = models.MedicalRecord(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        allergies=[],
        chronic_conditions=[],
        current_medications=[],
        visit_notes="",
        updated_by=current_user.email if current_user else "System",
    )
    db.add(medical_rec)
    db.commit()
    db.refresh(patient)

    if current_user:
        log_phi_access(
            db,
            user_id=current_user.email,
            user_role=current_user.role,
            action="CREATE",
            patient_id=patient.id,
        )
    return patient, is_duplicate


def get_patient_by_id(
    db: Session, patient_id: str, current_user: models.User
) -> Optional[models.Patient]:
    patient = (
        db.query(models.Patient)
        .filter(
            or_(
                models.Patient.id == patient_id,
                models.Patient.patient_code == patient_id,
            )
        )
        .first()
    )
    if patient and current_user:
        log_phi_access(
            db,
            user_id=current_user.email,
            user_role=current_user.role,
            action="READ",
            patient_id=patient.id,
        )
    return patient
