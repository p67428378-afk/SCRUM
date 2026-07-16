from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import date

from server.database import get_db
from server.models.booking import Booking
from server.models.room import Room
from server.schemas.booking import BookingResponse, BookingCreate
from server.routers.auth import get_current_user, check_role

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


@router.get("", response_model=List[BookingResponse])
def get_bookings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Booking).all()


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator", "Manager", "Receptionist"])),
):
    # 1. Check if room exists
    room = db.query(Room).filter(Room.id == booking_in.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
        )

    # 2. Check dates validity
    if booking_in.check_in_date >= booking_in.check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date must be before check-out date",
        )

    # 3. Check for double-bookings
    overlapping_booking = (
        db.query(Booking)
        .filter(
            and_(
                Booking.room_id == booking_in.room_id,
                Booking.status != "Cancelled",
                or_(
                    and_(
                        Booking.check_in_date <= booking_in.check_in_date,
                        Booking.check_out_date > booking_in.check_in_date,
                    ),
                    and_(
                        Booking.check_in_date < booking_in.check_out_date,
                        Booking.check_out_date >= booking_in.check_out_date,
                    ),
                    and_(
                        Booking.check_in_date >= booking_in.check_in_date,
                        Booking.check_out_date <= booking_in.check_out_date,
                    ),
                ),
            )
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is already booked for the selected dates",
        )

    # 4. Calculate total amount
    nights = (booking_in.check_out_date - booking_in.check_in_date).days
    total_amount = float(room.price_per_night) * nights

    # 5. Create booking
    db_booking = Booking(
        room_id=booking_in.room_id,
        guest_name=booking_in.guest_name,
        check_in_date=booking_in.check_in_date,
        check_out_date=booking_in.check_out_date,
        status="Booked",
        total_amount=total_amount,
    )
    db.add(db_booking)

    # Update room status to Occupied if check-in is today
    if booking_in.check_in_date <= date.today() <= booking_in.check_out_date:
        room.status = "Occupied"

    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator", "Manager", "Receptionist"])),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    booking.status = "Cancelled"

    # If room was occupied by this booking, set it back to Available or Dirty
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room and room.status == "Occupied":
        room.status = "Available"

    db.commit()
    return {"message": "Booking cancelled successfully"}
