import uuid
from datetime import datetime, date
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from server.models import Patient, MedicalRecord
from server.schemas import PatientCreate, PatientUpdate
from server.services.audit_service import log_phi_access


def generate_patient_code(db: Session) -> str:
    count = db.query(Patient).count()
    code_num = 1001 + count
    patient_code = f"PAT-{code_num}"

    # Ensure uniqueness
    while db.query(Patient).filter(Patient.patient_code == patient_code).first():
        code_num += 1
        patient_code = f"PAT-{code_num}"
    return patient_code


def check_duplicate_patient(
    db: Session,
    ssn: Optional[str] = None,
    full_name: Optional[str] = None,
    date_of_birth: Optional[date] = None,
) -> Optional[Patient]:
    if ssn and ssn.strip():
        existing_ssn = db.query(Patient).filter(Patient.ssn == ssn.strip()).first()
        if existing_ssn:
            return existing_ssn

    if full_name and date_of_birth:
        existing_name_dob = (
            db.query(Patient)
            .filter(
                and_(
                    Patient.full_name.ilike(full_name.strip()),
                    Patient.date_of_birth == date_of_birth,
                )
            )
            .first()
        )
        if existing_name_dob:
            return existing_name_dob

    return None


def create_patient(
    db: Session,
    patient_in: PatientCreate,
    override_duplicate: bool = False,
    current_user_id: str = "system",
    current_user_role: str = "Doctor",
) -> Tuple[Optional[Patient], Optional[Patient]]:
    duplicate = check_duplicate_patient(
        db,
        ssn=patient_in.ssn,
        full_name=patient_in.full_name,
        date_of_birth=patient_in.date_of_birth,
    )

    if duplicate and not override_duplicate:
        return None, duplicate

    patient_id = str(uuid.uuid4())
    patient_code = generate_patient_code(db)

    patient = Patient(
        id=patient_id,
        patient_code=patient_code,
        full_name=patient_in.full_name.strip(),
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        ssn=patient_in.ssn,
        contact_number=patient_in.contact_number,
        email=patient_in.email,
        address=patient_in.address,
        emergency_contact=patient_in.emergency_contact,
        insurance_info=patient_in.insurance_info,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Initialize empty MedicalRecord
    medical_record = MedicalRecord(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        allergies=[],
        chronic_conditions=[],
        current_medications=[],
        visit_notes="",
        updated_by=current_user_id,
        version=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(medical_record)
    db.commit()

    log_phi_access(
        db=db,
        user_id=current_user_id,
        user_role=current_user_role,
        action="CREATE",
        patient_id=patient.id,
    )

    return patient, None


def get_patient_by_id(db: Session, patient_id_or_code: str) -> Optional[Patient]:
    patient = (
        db.query(Patient)
        .filter(
            or_(
                Patient.id == patient_id_or_code,
                Patient.patient_code == patient_id_or_code,
            )
        )
        .first()
    )
    return patient


def update_patient(
    db: Session,
    patient_id: str,
    patient_in: PatientUpdate,
    current_user_id: str = "system",
    current_user_role: str = "Doctor",
) -> Optional[Patient]:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)

    log_phi_access(
        db=db,
        user_id=current_user_id,
        user_role=current_user_role,
        action="UPDATE",
        patient_id=patient.id,
    )

    return patient


def mask_patient_dict_for_role(
    patient_dict: Dict[str, Any], role: str
) -> Dict[str, Any]:
    if role == "Receptionist":
        # Mask SSN
        ssn = patient_dict.get("ssn")
        if ssn:
            if len(ssn) >= 4:
                patient_dict["ssn"] = "XXX-XX-" + ssn[-4:]
            else:
                patient_dict["ssn"] = "XXX-XX-XXXX"
        # Mask clinical notes in medical_record if present
        mr = patient_dict.get("medical_record")
        if mr and isinstance(mr, dict):
            mr["visit_notes"] = "[RESTRICTED - DOCTOR/NURSE ACCESS ONLY]"
    return patient_dict
