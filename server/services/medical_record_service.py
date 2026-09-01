import uuid
from typing import Optional
from sqlalchemy.orm import Session
from server import models, schemas
from server.services.audit_service import log_phi_access


def update_medical_record(
    db: Session,
    patient_id: str,
    record_in: schemas.MedicalHistoryUpdate,
    current_user: models.User,
) -> Optional[models.MedicalRecord]:
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        return None

    record = (
        db.query(models.MedicalRecord)
        .filter(models.MedicalRecord.patient_id == patient_id)
        .first()
    )
    editor = current_user.email if current_user else "System"
    if not record:
        record = models.MedicalRecord(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            allergies=record_in.allergies or [],
            chronic_conditions=record_in.chronic_conditions or [],
            current_medications=record_in.current_medications or [],
            visit_notes=record_in.visit_notes,
            updated_by=editor,
        )
        db.add(record)
    else:
        if record_in.allergies is not None:
            record.allergies = record_in.allergies
        if record_in.chronic_conditions is not None:
            record.chronic_conditions = record_in.chronic_conditions
        if record_in.current_medications is not None:
            record.current_medications = record_in.current_medications
        if record_in.visit_notes is not None:
            record.visit_notes = record_in.visit_notes
        record.updated_by = editor

    db.commit()
    db.refresh(record)

    if current_user:
        log_phi_access(
            db,
            user_id=current_user.email,
            user_role=current_user.role,
            action="UPDATE",
            patient_id=patient_id,
        )
    return record
