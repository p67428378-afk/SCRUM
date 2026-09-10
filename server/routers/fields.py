from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["fields"])


@router.get("/fields", response_model=List[schemas.FieldResponse])
def list_fields(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Field).all()


@router.post(
    "/fields", response_model=schemas.FieldResponse, status_code=status.HTTP_201_CREATED
)
def create_field(
    field_data: schemas.FieldCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    field = models.Field(
        name=field_data.name,
        acreage=field_data.acreage,
        location_gis=field_data.location_gis,
        soil_type=field_data.soil_type,
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.get("/fields/{field_id}", response_model=schemas.FieldResponse)
def get_field(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@router.post(
    "/crop-cycles",
    response_model=schemas.CropCycleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_crop_cycle(
    crop_data: schemas.CropCycleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    field = db.query(models.Field).filter(models.Field.id == crop_data.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    # Business rule: Check overlapping crop cycles
    existing_active = (
        db.query(models.CropCycle)
        .filter(
            models.CropCycle.field_id == crop_data.field_id,
            models.CropCycle.status.in_(["PLANTED", "ACTIVE"]),
        )
        .first()
    )

    notes = crop_data.soil_health_notes or ""
    if existing_active:
        warning_msg = f"[WARNING: Overlapping crop cycle detected with {existing_active.crop_type}] "
        notes = warning_msg + notes

        # Trigger operational alert
        alert = models.OperationalAlert(
            alert_type="CROP_OVERLAP",
            severity="WARNING",
            message=f"Overlapping crop cycle created on field '{field.name}' for crop {crop_data.crop_type}",
            is_resolved=False,
        )
        db.add(alert)

    crop_cycle = models.CropCycle(
        field_id=crop_data.field_id,
        crop_type=crop_data.crop_type,
        planting_date=crop_data.planting_date,
        target_harvest_date=crop_data.target_harvest_date,
        soil_health_notes=notes,
        status=crop_data.status or "PLANTED",
    )
    db.add(crop_cycle)
    db.commit()
    db.refresh(crop_cycle)
    return crop_cycle


@router.get("/crop-cycles", response_model=List[schemas.CropCycleResponse])
def list_crop_cycles(
    field_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.CropCycle)
    if field_id:
        query = query.filter(models.CropCycle.field_id == field_id)
    return query.all()
