from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/livestock", tags=["livestock"])


@router.get("", response_model=List[schemas.LivestockResponse])
def list_livestock(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Livestock).all()


@router.post(
    "", response_model=schemas.LivestockResponse, status_code=status.HTTP_201_CREATED
)
def create_livestock(
    livestock_data: schemas.LivestockCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Livestock)
        .filter(models.Livestock.tag_number == livestock_data.tag_number)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Livestock tag number already exists",
        )

    animal = models.Livestock(
        tag_number=livestock_data.tag_number,
        species=livestock_data.species,
        breed=livestock_data.breed,
        birth_date=livestock_data.birth_date,
        status=livestock_data.status or "HEALTHY",
    )
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


@router.get("/{id}", response_model=schemas.LivestockResponse)
def get_livestock(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    animal = db.query(models.Livestock).filter(models.Livestock.id == id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Livestock not found")
    return animal


@router.post(
    "/{id}/health-records",
    response_model=schemas.HealthRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_health_record(
    id: str,
    record_data: schemas.HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    animal = db.query(models.Livestock).filter(models.Livestock.id == id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Livestock not found")

    # Business rule: Mandatory fields for medical records
    if (
        not record_data.event_date
        or not record_data.medication_name
        or not record_data.medication_name.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Medical records require mandatory fields (event_date, medication_name) before saving",
        )

    record = models.HealthRecord(
        livestock_id=id,
        event_type=record_data.event_type,
        event_date=record_data.event_date,
        medication_name=record_data.medication_name,
        next_due_date=record_data.next_due_date,
        notes=record_data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{id}/health-records", response_model=List[schemas.HealthRecordResponse])
def list_health_records(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    animal = db.query(models.Livestock).filter(models.Livestock.id == id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Livestock not found")
    return animal.health_records


@router.post(
    "/{id}/feeding-logs",
    response_model=schemas.FeedingLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_feeding_log(
    id: str,
    feeding_data: schemas.FeedingLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    animal = db.query(models.Livestock).filter(models.Livestock.id == id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Livestock not found")

    f_log = models.FeedingLog(
        livestock_id=id,
        feed_type=feeding_data.feed_type,
        quantity=feeding_data.quantity,
        unit=feeding_data.unit or "kg",
        feeding_time=feeding_data.feeding_time,
        notes=feeding_data.notes,
    )
    db.add(f_log)
    db.commit()
    db.refresh(f_log)
    return f_log


@router.get("/{id}/feeding-logs", response_model=List[schemas.FeedingLogResponse])
def list_feeding_logs(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    animal = db.query(models.Livestock).filter(models.Livestock.id == id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Livestock not found")
    return animal.feeding_logs
