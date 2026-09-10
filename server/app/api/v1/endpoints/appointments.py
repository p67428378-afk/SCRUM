from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db
from server.app.services import scheduling_service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/available-slots", response_model=schemas.AvailableSlotsListResponse)
def get_available_slots(
    service_id: str = Query(..., description="Service UUID"),
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    staff_id: Optional[str] = Query(None, description="Optional Staff UUID"),
    db: Session = Depends(get_db),
):
    slots = scheduling_service.find_available_slots(
        db, service_id=service_id, date_str=date, staff_id=staff_id
    )
    return schemas.AvailableSlotsListResponse(slots=slots)


@router.post(
    "", response_model=schemas.AppointmentResponse, status_code=status.HTTP_201_CREATED
)
def create_appointment(
    appt_in: schemas.AppointmentCreate, db: Session = Depends(get_db)
):
    return scheduling_service.create_appointment(
        db,
        customer_id=appt_in.customer_id,
        staff_id=appt_in.staff_id,
        service_id=appt_in.service_id,
        start_time=appt_in.start_time,
    )


@router.get("", response_model=List[schemas.AppointmentResponse])
def list_appointments(
    customer_id: Optional[str] = None,
    staff_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Appointment)
    if customer_id:
        query = query.filter(models.Appointment.customer_id == customer_id)
    if staff_id:
        query = query.filter(models.Appointment.staff_id == staff_id)
    if status_filter:
        query = query.filter(models.Appointment.status == status_filter)

    return (
        query.order_by(models.Appointment.start_time.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{appointment_id}", response_model=schemas.AppointmentResponse)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter_by(id=appointment_id).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )
    return appt


@router.patch("/{appointment_id}/cancel", response_model=schemas.AppointmentResponse)
def cancel_appointment(
    appointment_id: str,
    cancel_in: Optional[schemas.AppointmentCancel] = None,
    force: bool = Query(False, description="Manager override to bypass 2h rule"),
    db: Session = Depends(get_db),
):
    reason = cancel_in.reason if cancel_in else "Cancelled by user"
    return scheduling_service.cancel_appointment(
        db, appointment_id=appointment_id, reason=reason, force=force
    )


@router.patch("/{appointment_id}/complete", response_model=schemas.AppointmentResponse)
@router.post("/{appointment_id}/complete", response_model=schemas.AppointmentResponse)
def complete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    return scheduling_service.complete_appointment(db, appointment_id=appointment_id)
