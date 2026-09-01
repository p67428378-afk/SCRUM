from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientSearchResponse,
    PatientListItem,
    MedicalRecordUpdate,
    MedicalRecordResponse,
)
from server.core.auth import get_current_user, require_roles, get_current_user_optional
from server.services.patient_service import (
    create_patient,
    get_patient_by_id,
    update_patient,
    mask_patient_dict_for_role,
)
from server.services.search_service import search_patients
from server.services.medical_record_service import (
    get_medical_record_by_patient_id,
    update_medical_record,
)
from server.services.audit_service import log_phi_access

router = APIRouter(prefix="/patients", tags=["Patients Management"])


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(
    patient_in: PatientCreate,
    override_duplicate: bool = Query(
        False, description="Override duplicate check if warning previously ignored"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "Doctor", "Nurse", "Receptionist")
    ),
):
    patient, duplicate = create_patient(
        db=db,
        patient_in=patient_in,
        override_duplicate=override_duplicate,
        current_user_id=current_user.email,
        current_user_role=current_user.role,
    )

    if duplicate and not override_duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Potential duplicate record detected by matching SSN or Name + DOB.",
                "duplicate_found": True,
                "existing_patient": {
                    "id": duplicate.id,
                    "patient_code": duplicate.patient_code,
                    "full_name": duplicate.full_name,
                    "date_of_birth": str(duplicate.date_of_birth),
                },
            },
        )

    return patient


@router.get("/search", response_model=PatientSearchResponse)
def search_patient_records(
    query: Optional[str] = Query(
        None, description="Search term matching Name, ID, Phone, Email, SSN"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    gender: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    total, items = search_patients(
        db, query=query, skip=skip, limit=limit, gender=gender
    )

    user_id = current_user.email if current_user else "anonymous"
    user_role = current_user.role if current_user else "Public"

    log_phi_access(
        db=db, user_id=user_id, user_role=user_role, action="SEARCH", patient_id=None
    )

    list_items = []
    for p in items:
        mr = p.medical_record
        last_visit = mr.updated_at if mr else p.updated_at
        list_items.append(
            PatientListItem(
                id=p.id,
                patient_code=p.patient_code,
                full_name=p.full_name,
                date_of_birth=p.date_of_birth,
                gender=p.gender,
                contact_number=p.contact_number,
                email=p.email,
                insurance_info=p.insurance_info,
                created_at=p.created_at,
                last_visit=last_visit,
            )
        )

    return PatientSearchResponse(total=total, skip=skip, limit=limit, items=list_items)


@router.get("", response_model=PatientSearchResponse)
def list_patients(
    query: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    gender: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return search_patient_records(
        query=query,
        skip=skip,
        limit=limit,
        gender=gender,
        db=db,
        current_user=current_user,
    )


@router.get("/{id}", response_model=PatientResponse)
def get_patient_profile(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_by_id(db, id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID or code '{id}' not found.",
        )

    log_phi_access(
        db=db,
        user_id=current_user.email,
        user_role=current_user.role,
        action="READ",
        patient_id=patient.id,
    )

    # Convert to dict and apply role masking if Receptionist
    p_resp = PatientResponse.model_validate(patient)
    p_dict = p_resp.model_dump()
    masked_dict = mask_patient_dict_for_role(p_dict, current_user.role)

    return PatientResponse.model_validate(masked_dict)


@router.put("/{id}", response_model=PatientResponse)
def update_patient_profile(
    id: str,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Admin", "Doctor", "Nurse")),
):
    patient = get_patient_by_id(db, id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found.",
        )

    updated = update_patient(
        db=db,
        patient_id=patient.id,
        patient_in=patient_in,
        current_user_id=current_user.email,
        current_user_role=current_user.role,
    )
    return updated


@router.put("/{id}/medical-history", response_model=MedicalRecordResponse)
def update_patient_medical_history(
    id: str,
    record_in: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Admin", "Doctor", "Nurse")),
):
    patient = get_patient_by_id(db, id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found.",
        )

    record = update_medical_record(
        db=db,
        patient_id=patient.id,
        record_in=record_in,
        updated_by_id=current_user.email,
        current_user_role=current_user.role,
    )
    return record


@router.get("/{id}/medical-history", response_model=MedicalRecordResponse)
def get_patient_medical_history(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_by_id(db, id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found.",
        )

    record = get_medical_record_by_patient_id(db, patient.id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical record for patient ID '{id}' not found.",
        )

    log_phi_access(
        db=db,
        user_id=current_user.email,
        user_role=current_user.role,
        action="READ_MEDICAL_RECORD",
        patient_id=patient.id,
    )

    mr_resp = MedicalRecordResponse.model_validate(record)
    mr_dict = mr_resp.model_dump()
    if current_user.role == "Receptionist":
        mr_dict["visit_notes"] = "[RESTRICTED - DOCTOR/NURSE ACCESS ONLY]"

    return MedicalRecordResponse.model_validate(mr_dict)
