from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Doctor
from server.schemas import Doctor as DoctorSchema, DoctorCreate

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])


@router.get("", response_model=List[DoctorSchema])
def list_doctors(db: Session = Depends(get_db)):
    """Retrieve all available doctors and healthcare providers."""
    doctors = db.query(Doctor).order_by(Doctor.full_name.asc()).all()
    return doctors


@router.post("", response_model=DoctorSchema, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    """Register a new healthcare provider."""
    existing = db.query(Doctor).filter(Doctor.email == doctor_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor with email '{doctor_in.email}' already exists.",
        )

    new_doctor = Doctor(**doctor_in.model_dump())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor


@router.get("/{id}", response_model=DoctorSchema)
def get_doctor(id: str, db: Session = Depends(get_db)):
    """Retrieve a doctor profile by UUID."""
    doctor = db.query(Doctor).filter(Doctor.id == id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with ID '{id}' not found.",
        )
    return doctor
