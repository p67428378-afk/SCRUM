from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[schemas.UserResponse])
def list_residents(
    search: Optional[str] = Query(
        None, description="Search by name, email, or household address"
    ),
    role: Optional[str] = Query(
        None, description="Filter by role (Admin, Resident, Staff)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (models.User.full_name.ilike(pattern))
            | (models.User.email.ilike(pattern))
            | (models.User.household_address.ilike(pattern))
        )
    residents = query.offset(skip).limit(limit).all()
    return residents


@router.get("/{resident_id}", response_model=schemas.UserResponse)
def get_resident(
    resident_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resident = db.query(models.User).filter(models.User.id == resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resident profile not found"
        )
    return resident


@router.patch("/{resident_id}", response_model=schemas.UserResponse)
def update_resident(
    resident_id: str,
    update_data: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != resident_id and current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile unless you are an Admin",
        )

    resident = db.query(models.User).filter(models.User.id == resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resident profile not found"
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        if field == "role" and current_user.role != "Admin":
            continue  # Only Admin can update role
        setattr(resident, field, value)

    db.commit()
    db.refresh(resident)
    return resident
