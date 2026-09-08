from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter()


def normalize_time(t_str: str) -> str:
    """Ensure time format HH:MM:SS."""
    parts = t_str.strip().split(":")
    if len(parts) == 2:
        return f"{parts[0].zfill(2)}:{parts[1].zfill(2)}:00"
    elif len(parts) == 3:
        return f"{parts[0].zfill(2)}:{parts[1].zfill(2)}:{parts[2].zfill(2)}"
    return t_str


@router.post(
    "", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_in: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Verify Facility
    facility = (
        db.query(models.Facility)
        .filter(models.Facility.id == booking_in.facility_id)
        .first()
    )
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found"
        )
    if not facility.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is currently inactive",
        )

    start_t = normalize_time(booking_in.start_time)
    end_t = normalize_time(booking_in.end_time)

    if start_t >= end_t:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be strictly after start time",
        )

    # 2. Check for time slot conflicts with transaction lock (with_for_update where supported)
    existing_query = db.query(models.Booking).filter(
        models.Booking.facility_id == booking_in.facility_id,
        models.Booking.booking_date == booking_in.booking_date,
        models.Booking.status != "Cancelled",
    )

    # Attempt pessimistic lock for DB concurrency
    try:
        existing_bookings = existing_query.with_for_update().all()
    except Exception:
        existing_bookings = existing_query.all()

    for existing in existing_bookings:
        e_start = normalize_time(existing.start_time)
        e_end = normalize_time(existing.end_time)
        # Overlap check: existing.start < new.end AND existing.end > new.start
        if e_start < end_t and e_end > start_t:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Facility is already booked for the selected time slot",
            )

    # 3. Create Booking
    new_booking = models.Booking(
        facility_id=booking_in.facility_id,
        resident_id=current_user.id,
        booking_date=booking_in.booking_date,
        start_time=start_t,
        end_time=end_t,
        purpose=booking_in.purpose,
        status="Confirmed",
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking


@router.get("", response_model=List[schemas.BookingResponse])
def list_bookings(
    facility_id: Optional[str] = Query(None),
    booking_date: Optional[str] = Query(None),
    resident_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Booking)
    if facility_id:
        query = query.filter(models.Booking.facility_id == facility_id)
    if booking_date:
        query = query.filter(models.Booking.booking_date == booking_date)
    if resident_id:
        query = query.filter(models.Booking.resident_id == resident_id)
    if status_filter:
        query = query.filter(models.Booking.status == status_filter)

    bookings = (
        query.order_by(
            models.Booking.booking_date.desc(), models.Booking.start_time.asc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return bookings


@router.delete("/{booking_id}", response_model=schemas.BookingResponse)
def cancel_booking(
    booking_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    if booking.resident_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings unless you are an Admin",
        )

    booking.status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return booking
