import uuid
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models import User, Pooja, PoojaSlot, Booking
from server.app.schemas import PoojaOut, PoojaSlotOut, BookingCreate, BookingOut
from server.app.utils.security import get_current_user

router = APIRouter(tags=["Pooja & Seva Bookings"])


@router.get("/api/v1/poojas", response_model=List[PoojaOut])
def list_poojas(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    poojas = (
        db.query(Pooja).filter(Pooja.is_active == True).offset(skip).limit(limit).all()
    )
    return poojas


@router.get("/api/v1/poojas/{pooja_id}/slots", response_model=List[PoojaSlotOut])
def list_pooja_slots(
    pooja_id: str,
    slot_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    query = db.query(PoojaSlot).filter(PoojaSlot.pooja_id == pooja_id)
    if slot_date:
        query = query.filter(PoojaSlot.slot_date == slot_date)
    slots = query.order_by(PoojaSlot.slot_date, PoojaSlot.start_time).all()
    return slots


@router.post(
    "/api/v1/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Retrieve slot with database row lock for strict concurrency safety
    try:
        slot = (
            db.query(PoojaSlot)
            .filter(PoojaSlot.id == booking_in.slot_id)
            .with_for_update()
            .first()
        )
    except Exception:
        # Fallback if SQLite lock syntax differs
        slot = db.query(PoojaSlot).filter(PoojaSlot.id == booking_in.slot_id).first()

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_440_NOT_FOUND
            if hasattr(status, "HTTP_440_NOT_FOUND")
            else status.HTTP_404_NOT_FOUND,
            detail="Requested Pooja slot not found",
        )

    if slot.booked_count >= slot.max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected slot is fully booked. Please select another slot or time.",
        )

    pooja = db.query(Pooja).filter(Pooja.id == slot.pooja_id).first()
    amount_paid = float(pooja.price) if pooja else 0.0

    # Increment slot count
    slot.booked_count += 1

    # Generate unique reference code
    ref_code = f"SHIV-BKG-{uuid.uuid4().hex[:8].upper()}"

    booking = Booking(
        booking_reference=ref_code,
        user_id=current_user.id,
        slot_id=slot.id,
        devotee_name=booking_in.devotee_name,
        devotee_phone=booking_in.devotee_phone or current_user.phone,
        gotra=booking_in.gotra,
        nakshatra=booking_in.nakshatra,
        booking_type=booking_in.booking_type or "Online",
        status="Confirmed",
        amount_paid=amount_paid,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/api/v1/bookings/my-bookings", response_model=List[BookingOut])
def get_my_bookings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return bookings


@router.post("/api/v1/bookings/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    if booking.user_id != current_user.id and current_user.role not in [
        "Admin",
        "Staff",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking",
        )

    if booking.status == "Cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled",
        )

    booking.status = "Cancelled"
    if booking.slot:
        booking.slot.booked_count = max(0, booking.slot.booked_count - 1)

    db.commit()
    db.refresh(booking)
    return booking
