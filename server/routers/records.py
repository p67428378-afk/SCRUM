from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import MedicalRecord, Patient, Doctor
from server.schemas import MedicalRecord as MedicalRecordSchema, MedicalRecordCreate

router = APIRouter(prefix="/api/v1/records", tags=["Medical Records"])


@router.get("/patient/{patient_id}", response_model=List[MedicalRecordSchema])
def get_patient_records(patient_id: str, db: Session = Depends(get_db)):
    """Retrieve all medical records and clinical notes for a specific patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found.",
        )

    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )

    return records


@router.post(
    "", response_model=MedicalRecordSchema, status_code=status.HTTP_201_CREATED
)
def create_medical_record(
    record_in: MedicalRecordCreate, db: Session = Depends(get_db)
):
    """Append a new medical record or clinical note to a patient's chart."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{record_in.patient_id}' not found.",
        )

    # Verify doctor exists if doctor_id is provided
    if record_in.doctor_id:
        doctor = db.query(Doctor).filter(Doctor.id == record_in.doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor with ID '{record_in.doctor_id}' not found.",
            )

    new_record = MedicalRecord(**record_in.model_dump())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record
