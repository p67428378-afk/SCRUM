from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Appointment, Doctor, Patient
from server.schemas import (
    Appointment as AppointmentSchema,
    AppointmentCreate,
    AppointmentUpdate,
)

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

STANDARD_TIME_SLOTS = [
    "09:00 AM - 09:30 AM",
    "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 12:00 PM",
    "01:00 PM - 01:30 PM",
    "01:30 PM - 02:00 PM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
    "03:30 PM - 04:00 PM",
    "04:00 PM - 04:30 PM",
    "04:30 PM - 05:00 PM",
]


def get_available_doctor_slots(
    doctor_id: str, appt_date: date, db: Session, exclude_appt_id: Optional[str] = None
) -> List[str]:
    """Find available time slots for a doctor on a given date."""
    query = db.query(Appointment.time_slot).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appt_date,
        Appointment.status != "CANCELLED",
    )
    if exclude_appt_id:
        query = query.filter(Appointment.id != exclude_appt_id)

    booked_slots = {slot[0] for slot in query.all()}
    return [slot for slot in STANDARD_TIME_SLOTS if slot not in booked_slots]


@router.get("", response_model=List[AppointmentSchema])
def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    doctor_id: Optional[str] = Query(None),
    patient_id: Optional[str] = Query(None),
    date_filter: Optional[date] = Query(None, alias="date"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List appointments with optional filtering by doctor, patient, date, or status."""
    query = db.query(Appointment)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if date_filter:
        query = query.filter(Appointment.appointment_date == date_filter)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appointments = (
        query.order_by(Appointment.appointment_date.asc(), Appointment.time_slot.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return appointments


@router.get("/available-slots", response_model=List[str])
def get_available_slots(
    doctor_id: str = Query(...), date: date = Query(...), db: Session = Depends(get_db)
):
    """Retrieve available time slots for a doctor on a specific date."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with ID '{doctor_id}' not found.",
        )
    return get_available_doctor_slots(doctor_id, date, db)


@router.post("", response_model=AppointmentSchema, status_code=status.HTTP_201_CREATED)
def create_appointment(appt_in: AppointmentCreate, db: Session = Depends(get_db)):
    """Schedule a new appointment with doctor slot collision validation."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == appt_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{appt_in.patient_id}' not found.",
        )

    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appt_in.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with ID '{appt_in.doctor_id}' not found.",
        )

    # Check for slot collision
    collision = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == appt_in.doctor_id,
            Appointment.appointment_date == appt_in.appointment_date,
            Appointment.time_slot == appt_in.time_slot,
            Appointment.status != "CANCELLED",
        )
        .first()
    )

    if collision:
        alt_slots = get_available_doctor_slots(
            appt_in.doctor_id, appt_in.appointment_date, db
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": f"Time slot '{appt_in.time_slot}' is already booked for Dr. {doctor.full_name} on {appt_in.appointment_date}.",
                "alternative_slots": alt_slots,
            },
        )

    new_appointment = Appointment(
        patient_id=appt_in.patient_id,
        doctor_id=appt_in.doctor_id,
        appointment_date=appt_in.appointment_date,
        time_slot=appt_in.time_slot,
        appointment_type=appt_in.appointment_type,
        status="SCHEDULED",
        notes=appt_in.notes,
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment


@router.get("/{id}", response_model=AppointmentSchema)
def get_appointment(id: str, db: Session = Depends(get_db)):
    """Retrieve an appointment by UUID."""
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID '{id}' not found.",
        )
    return appointment


@router.put("/{id}", response_model=AppointmentSchema)
def update_appointment(
    id: str, appt_in: AppointmentUpdate, db: Session = Depends(get_db)
):
    """Reschedule or update appointment status and notes."""
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID '{id}' not found.",
        )

    update_data = appt_in.model_dump(exclude_unset=True)

    # Check for slot collisions if date or time_slot changed
    target_date = update_data.get("appointment_date", appointment.appointment_date)
    target_slot = update_data.get("time_slot", appointment.time_slot)
    target_status = update_data.get("status", appointment.status)

    if target_status != "CANCELLED" and (
        target_date != appointment.appointment_date
        or target_slot != appointment.time_slot
    ):
        collision = (
            db.query(Appointment)
            .filter(
                Appointment.doctor_id == appointment.doctor_id,
                Appointment.appointment_date == target_date,
                Appointment.time_slot == target_slot,
                Appointment.status != "CANCELLED",
                Appointment.id != id,
            )
            .first()
        )

        if collision:
            alt_slots = get_available_doctor_slots(
                appointment.doctor_id, target_date, db, exclude_appt_id=id
            )
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "detail": f"Time slot '{target_slot}' is already booked on {target_date}.",
                    "alternative_slots": alt_slots,
                },
            )

    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{id}")
def cancel_appointment(id: str, db: Session = Depends(get_db)):
    """Cancel an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID '{id}' not found.",
        )

    appointment.status = "CANCELLED"
    db.commit()
    return {
        "message": "Appointment cancelled successfully.",
        "id": id,
        "status": "CANCELLED",
    }
