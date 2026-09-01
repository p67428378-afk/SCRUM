import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import Patient
from server.schemas import Patient as PatientSchema, PatientCreate, PatientUpdate

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])


def hash_ssn(ssn: Optional[str]) -> Optional[str]:
    """Hash SSN string using SHA-256 for duplicate detection."""
    if not ssn:
        return None
    cleaned_ssn = ssn.strip().replace("-", "").replace(" ", "")
    return hashlib.sha256(cleaned_ssn.encode("utf-8")).hexdigest()


@router.get("", response_model=List[PatientSchema])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve a paginated list of patients."""
    patients = (
        db.query(Patient)
        .order_by(Patient.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return patients


@router.get("/search", response_model=List[PatientSchema])
def search_patients(
    q: str = Query("", description="Search term for name, ID, or phone number"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search patients by name, phone, or UUID."""
    search_term = q.strip()
    if not search_term:
        return (
            db.query(Patient)
            .order_by(Patient.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    pattern = f"%{search_term}%"
    patients = (
        db.query(Patient)
        .filter(
            or_(
                Patient.full_name.ilike(pattern),
                Patient.id.ilike(pattern),
                Patient.phone.ilike(pattern),
                Patient.email.ilike(pattern),
            )
        )
        .order_by(Patient.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return patients


@router.post("", response_model=PatientSchema, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient with demographic data and duplicate SSN detection."""
    ssn_hash = hash_ssn(patient_in.ssn)
    if ssn_hash:
        existing = db.query(Patient).filter(Patient.ssn_hash == ssn_hash).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A patient with this SSN or national identification is already registered.",
            )

    patient_data = patient_in.model_dump(exclude={"ssn"})
    new_patient = Patient(**patient_data, ssn_hash=ssn_hash)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@router.get("/{id}", response_model=PatientSchema)
def get_patient(id: str, db: Session = Depends(get_db)):
    """Retrieve a patient profile by UUID."""
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found.",
        )
    return patient


@router.put("/{id}", response_model=PatientSchema)
def update_patient(id: str, patient_in: PatientUpdate, db: Session = Depends(get_db)):
    """Update an existing patient profile."""
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found.",
        )

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient
