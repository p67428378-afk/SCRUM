from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.core.auth import get_current_user, check_role
from server import models, schemas
from server.services import patient_service, search_service, medical_record_service

router = APIRouter(prefix="/patients", tags=["patients"])


def format_patient_response(patient: models.Patient, role: str = "Doctor") -> dict:
    data = {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "full_name": patient.full_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "contact_number": patient.contact_number,
        "email": patient.email,
        "address": patient.address,
        "emergency_contact": patient.emergency_contact,
        "insurance_info": patient.insurance_info,
        "ssn_masked": patient_service.mask_ssn(patient.ssn),
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
    }

    if patient.medical_record:
        rec = patient.medical_record
        notes = rec.visit_notes
        if role == "Receptionist" and notes:
            notes = "[MASKED - Medical Doctor Access Required]"
        data["medical_record"] = {
            "id": rec.id,
            "patient_id": rec.patient_id,
            "allergies": rec.allergies or [],
            "chronic_conditions": rec.chronic_conditions or [],
            "current_medications": rec.current_medications or [],
            "visit_notes": notes,
            "updated_by": rec.updated_by,
            "created_at": rec.created_at,
            "updated_at": rec.updated_at,
        }
    return data


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        check_role(["Admin", "Doctor", "Nurse", "Receptionist"])
    ),
):
    patient, is_duplicate = patient_service.create_patient(db, patient_in, current_user)
    role = current_user.role if current_user else "Doctor"
    resp = format_patient_response(patient, role)
    resp["is_duplicate_warning"] = is_duplicate
    return resp


@router.get("/search", response_model=dict)
def search_patients(
    query: Optional[str] = Query(None, description="Search by name, code, DOB, phone"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    role = current_user.role if current_user else "Doctor"
    items, total = search_service.search_patients(
        db,
        query=query or "",
        gender=gender,
        skip=skip,
        limit=limit,
        current_user=current_user,
    )
    formatted_items = [format_patient_response(p, role) for p in items]
    return {"total": total, "skip": skip, "limit": limit, "items": formatted_items}


@router.get("/{id}", response_model=dict)
def get_patient(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    patient = patient_service.get_patient_by_id(db, id, current_user)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    role = current_user.role if current_user else "Doctor"
    return format_patient_response(patient, role)


@router.put("/{id}/medical-history", response_model=dict)
def update_medical_history(
    id: str,
    record_in: schemas.MedicalHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin", "Doctor", "Nurse"])),
):
    record = medical_record_service.update_medical_record(
        db, id, record_in, current_user
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    patient = patient_service.get_patient_by_id(db, id, current_user)
    role = current_user.role if current_user else "Doctor"
    return format_patient_response(patient, role)
