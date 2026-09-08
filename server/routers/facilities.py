from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user, require_role

router = APIRouter()


@router.get("", response_model=List[schemas.FacilityResponse])
def list_facilities(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Facility)
    if is_active is not None:
        query = query.filter(models.Facility.is_active == is_active)
    facilities = query.offset(skip).limit(limit).all()
    return facilities


@router.post(
    "", response_model=schemas.FacilityResponse, status_code=status.HTTP_201_CREATED
)
def create_facility(
    facility_in: schemas.FacilityCreate,
    current_user: models.User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.Facility)
        .filter(models.Facility.name == facility_in.name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Facility with this name already exists",
        )

    facility = models.Facility(**facility_in.model_dump())
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.get("/{facility_id}", response_model=schemas.FacilityResponse)
def get_facility(
    facility_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    facility = (
        db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    )
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found"
        )
    return facility


@router.patch("/{facility_id}", response_model=schemas.FacilityResponse)
def update_facility(
    facility_id: str,
    facility_update: schemas.FacilityUpdate,
    current_user: models.User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    facility = (
        db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    )
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found"
        )

    for field, value in facility_update.model_dump(exclude_unset=True).items():
        setattr(facility, field, value)

    db.commit()
    db.refresh(facility)
    return facility
