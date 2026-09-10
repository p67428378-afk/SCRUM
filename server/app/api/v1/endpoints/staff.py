import uuid
from datetime import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db

router = APIRouter(prefix="/staff", tags=["Staff"])


def parse_time_str(time_val: Optional[object]) -> Optional[time]:
    if not time_val:
        return None
    if isinstance(time_val, time):
        return time_val
    if isinstance(time_val, str):
        try:
            parts = time_val.split(":")
            return time(int(parts[0]), int(parts[1]))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid time format '{time_val}'. Expected HH:MM",
            )
    return None


def build_staff_response(staff_obj: models.Staff) -> schemas.StaffResponse:
    return schemas.StaffResponse.model_validate(staff_obj)


@router.get("", response_model=List[schemas.StaffResponse])
def list_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    staff_members = db.query(models.Staff).offset(skip).limit(limit).all()
    return [build_staff_response(s) for s in staff_members]


@router.post(
    "", response_model=schemas.StaffResponse, status_code=status.HTTP_201_CREATED
)
def create_staff(staff_in: schemas.StaffCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Staff).filter_by(email=staff_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff member with this email already exists",
        )

    new_staff = models.Staff(
        full_name=staff_in.full_name,
        email=staff_in.email,
        phone=staff_in.phone,
        is_active=staff_in.is_active,
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    # Assign services
    if staff_in.service_ids:
        services = (
            db.query(models.Service)
            .filter(models.Service.id.in_(staff_in.service_ids))
            .all()
        )
        new_staff.services = services

    # Create working schedules
    if staff_in.working_hours:
        for sched_in in staff_in.working_hours:
            sched = models.StaffSchedule(
                id=str(uuid.uuid4()),
                staff_id=new_staff.id,
                day_of_week=sched_in.day_of_week,
                start_time=parse_time_str(sched_in.start_time),
                end_time=parse_time_str(sched_in.end_time),
                break_start=parse_time_str(sched_in.break_start),
                break_end=parse_time_str(sched_in.break_end),
            )
            db.add(sched)

    db.commit()
    db.refresh(new_staff)
    return build_staff_response(new_staff)


@router.get("/{staff_id}", response_model=schemas.StaffResponse)
def get_staff(staff_id: str, db: Session = Depends(get_db)):
    staff_member = db.query(models.Staff).filter_by(id=staff_id).first()
    if not staff_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found"
        )
    return build_staff_response(staff_member)


@router.patch("/{staff_id}", response_model=schemas.StaffResponse)
def update_staff(
    staff_id: str, staff_in: schemas.StaffUpdate, db: Session = Depends(get_db)
):
    staff_member = db.query(models.Staff).filter_by(id=staff_id).first()
    if not staff_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found"
        )

    if staff_in.full_name is not None:
        staff_member.full_name = staff_in.full_name
    if staff_in.email is not None:
        staff_member.email = staff_in.email
    if staff_in.phone is not None:
        staff_member.phone = staff_in.phone
    if staff_in.is_active is not None:
        staff_member.is_active = staff_in.is_active

    if staff_in.service_ids is not None:
        services = (
            db.query(models.Service)
            .filter(models.Service.id.in_(staff_in.service_ids))
            .all()
        )
        staff_member.services = services

    if staff_in.working_hours is not None:
        # Delete old schedules
        db.query(models.StaffSchedule).filter_by(staff_id=staff_id).delete()
        for sched_in in staff_in.working_hours:
            sched = models.StaffSchedule(
                id=str(uuid.uuid4()),
                staff_id=staff_id,
                day_of_week=sched_in.day_of_week,
                start_time=parse_time_str(sched_in.start_time),
                end_time=parse_time_str(sched_in.end_time),
                break_start=parse_time_str(sched_in.break_start),
                break_end=parse_time_str(sched_in.break_end),
            )
            db.add(sched)

    db.commit()
    db.refresh(staff_member)
    return build_staff_response(staff_member)


@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(staff_id: str, db: Session = Depends(get_db)):
    staff_member = db.query(models.Staff).filter_by(id=staff_id).first()
    if not staff_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found"
        )
    staff_member.is_active = False
    db.commit()
    return None
