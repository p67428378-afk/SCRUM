from datetime import date
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from server.database import get_db
from server.models import Reservation, Room, Guest, User
from server.schemas import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    AvailabilityResponse,
)
from server.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/v1/reservations", tags=["Reservations"])


def check_room_overlap(
    db: Session,
    room_id: UUID,
    check_in_date: date,
    check_out_date: date,
    exclude_reservation_id: Optional[UUID] = None,
) -> bool:
    """Returns True if there is an overlapping Confirmed or Checked-In reservation."""
    query = db.query(Reservation).filter(
        Reservation.room_id == room_id,
        Reservation.status.in_(["Confirmed", "Checked-In"]),
        Reservation.check_in_date < check_out_date,
        Reservation.check_out_date > check_in_date,
    )
    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)
    return query.first() is not None


@router.get("/availability", response_model=AvailabilityResponse)
def check_availability(
    check_in_date: date = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out_date: date = Query(..., description="Check-out date (YYYY-MM-DD)"),
    number_of_guests: int = Query(1, ge=1, description="Number of guests"),
    room_type: Optional[str] = Query(None, description="Optional room type filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if check_out_date <= check_in_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be strictly after check-in date",
        )

    # Subquery for overlapping room IDs using select
    overlapping_room_ids = select(Reservation.room_id).filter(
        Reservation.status.in_(["Confirmed", "Checked-In"]),
        Reservation.check_in_date < check_out_date,
        Reservation.check_out_date > check_in_date,
    )

    query = db.query(Room).filter(
        Room.capacity >= number_of_guests,
        Room.status != "Maintenance",
        ~Room.id.in_(overlapping_room_ids),
    )
    if room_type:
        query = query.filter(Room.room_type == room_type)

    available_rooms = query.all()
    return AvailabilityResponse(
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        available_rooms=available_rooms,
    )


@router.get("", response_model=List[ReservationResponse])
def list_reservations(
    status_filter: Optional[str] = Query(None, alias="status"),
    guest_id: Optional[UUID] = Query(None),
    room_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    query = db.query(Reservation)
    if status_filter:
        query = query.filter(Reservation.status == status_filter)
    if guest_id:
        query = query.filter(Reservation.guest_id == guest_id)
    if room_id:
        query = query.filter(Reservation.room_id == room_id)

    return (
        query.order_by(Reservation.check_in_date.desc()).offset(skip).limit(limit).all()
    )


@router.post(
    "", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED
)
def create_reservation(
    res_in: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    if res_in.check_out_date <= res_in.check_in_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be strictly after check-in date",
        )

    room = db.query(Room).filter(Room.id == res_in.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
        )

    if room.capacity < res_in.number_of_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room capacity ({room.capacity}) is less than requested guests ({res_in.number_of_guests})",
        )

    # Check date overlap
    if check_room_overlap(
        db, res_in.room_id, res_in.check_in_date, res_in.check_out_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room #{room.room_number} is already booked for the selected date range",
        )

    # Guest handling
    guest_id = res_in.guest_id
    if not guest_id:
        if not res_in.guest_full_name or not res_in.guest_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either guest_id or guest_full_name and guest_email must be provided",
            )
        # Search or create guest
        existing_guest = (
            db.query(Guest).filter(Guest.email == res_in.guest_email).first()
        )
        if existing_guest:
            guest_id = existing_guest.id
        else:
            new_guest = Guest(
                full_name=res_in.guest_full_name,
                email=res_in.guest_email,
                phone=res_in.guest_phone,
                id_proof_number=res_in.guest_id_proof_number,
            )
            db.add(new_guest)
            db.flush()
            guest_id = new_guest.id

    nights = max((res_in.check_out_date - res_in.check_in_date).days, 1)
    total_amount = float(room.base_rate_per_night) * nights

    reservation = Reservation(
        room_id=res_in.room_id,
        guest_id=guest_id,
        check_in_date=res_in.check_in_date,
        check_out_date=res_in.check_out_date,
        number_of_guests=res_in.number_of_guests,
        total_amount=total_amount,
        status="Confirmed",
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )
    return res


@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: UUID,
    res_in: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    target_room_id = res_in.room_id or res.room_id
    target_check_in = res_in.check_in_date or res.check_in_date
    target_check_out = res_in.check_out_date or res.check_out_date

    if target_check_out <= target_check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be strictly after check-in date",
        )

    # Check overlap if dates or room modified
    if res_in.check_in_date or res_in.check_out_date or res_in.room_id:
        if check_room_overlap(
            db,
            target_room_id,
            target_check_in,
            target_check_out,
            exclude_reservation_id=res.id,
        ):
            room = db.query(Room).filter(Room.id == target_room_id).first()
            room_num = room.room_number if room else ""
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room #{room_num} is not available for the updated dates",
            )

    if res_in.room_id is not None:
        res.room_id = res_in.room_id
    if res_in.check_in_date is not None:
        res.check_in_date = res_in.check_in_date
    if res_in.check_out_date is not None:
        res.check_out_date = res_in.check_out_date
    if res_in.number_of_guests is not None:
        res.number_of_guests = res_in.number_of_guests
    if res_in.status is not None:
        res.status = res_in.status

    # Recalculate amount if dates or room changed
    room = db.query(Room).filter(Room.id == res.room_id).first()
    nights = max((res.check_out_date - res.check_in_date).days, 1)
    res.total_amount = float(room.base_rate_per_night) * nights

    db.commit()
    db.refresh(res)
    return res


@router.delete("/{reservation_id}", response_model=ReservationResponse)
def cancel_reservation(
    reservation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    res.status = "Cancelled"
    db.commit()
    db.refresh(res)
    return res
