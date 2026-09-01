import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from server.models import MedicalRecord, Patient
from server.schemas import MedicalRecordUpdate
from server.services.audit_service import log_phi_access


def get_medical_record_by_patient_id(
    db: Session, patient_id: str
) -> Optional[MedicalRecord]:
    return (
        db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).first()
    )


def update_medical_record(
    db: Session,
    patient_id: str,
    record_in: MedicalRecordUpdate,
    updated_by_id: str = "system",
    current_user_role: str = "Doctor",
) -> Optional[MedicalRecord]:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None

    record = (
        db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).first()
    )
    if not record:
        record = MedicalRecord(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            allergies=[],
            chronic_conditions=[],
            current_medications=[],
            visit_notes="",
            updated_by=updated_by_id,
            version=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(record)

    update_data = record_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(record, field, value)

    record.updated_by = updated_by_id
    record.version += 1
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)

    log_phi_access(
        db=db,
        user_id=updated_by_id,
        user_role=current_user_role,
        action="UPDATE_MEDICAL_RECORD",
        patient_id=patient_id,
    )

    return record
