"""
Module: routers.resident
Purpose: API router for Resident profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.resident import Resident, FamilyMember
from server.app.schemas.resident import ResidentUpdate, ResidentResponse

router = APIRouter(prefix="/api/v1/residents", tags=["residents"])


@router.put("/{id}", response_model=ResidentResponse)
def update_resident(id: str, payload: ResidentUpdate, db: Session = Depends(get_db)):
    """
    Update resident profile and their family members.
    """
    resident = db.query(Resident).filter(Resident.id == id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resident not found"
        )

    # Check if email is already taken by another resident
    existing_email = (
        db.query(Resident)
        .filter(Resident.email == payload.email, Resident.id != id)
        .first()
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
        )

    try:
        # Update resident fields
        resident.name = payload.name
        resident.email = payload.email
        resident.phone_number = payload.phone_number

        # Clear existing family members
        db.query(FamilyMember).filter(FamilyMember.resident_id == id).delete()

        # Add new family members
        for fm in payload.family_members:
            new_fm = FamilyMember(
                resident_id=id,
                name=fm.name,
                relationship=fm.relationship,
                phone_number=fm.phone_number,
            )
            db.add(new_fm)

        db.commit()
        db.refresh(resident)
        return resident
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}",
        )
