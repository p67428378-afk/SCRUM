from datetime import date
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Reservation, Room, Folio, User
from server.schemas import FolioResponse, CheckInRequest, CheckOutRequest
from server.auth import require_roles

router = APIRouter(prefix="/api/v1/folios", tags=["Folios & Billing"])


@router.get("/{reservation_id}", response_model=FolioResponse)
def get_folio(
    reservation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    folio = db.query(Folio).filter(Folio.reservation_id == reservation_id).first()
    if not folio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folio not found for reservation",
        )
    return folio


@router.post("/{reservation_id}/check-in", response_model=FolioResponse)
def check_in(
    reservation_id: UUID,
    req: Optional[CheckInRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    if res.status != "Confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot check in reservation with status '{res.status}'. Must be 'Confirmed'.",
        )

    if res.check_in_date > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-in is not allowed before arrival date ({res.check_in_date}).",
        )

    room = db.query(Room).filter(Room.id == res.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Associated room not found"
        )

    key_card = (req.key_card_assigned if req else None) or f"KEY-{room.room_number}"

    # Update reservation & room statuses
    res.status = "Checked-In"
    room.status = "Occupied"

    # Initialize folio
    room_charges = float(res.total_amount)
    tax_amount = round(room_charges * 0.10, 2)  # 10% tax
    total_due = round(room_charges + tax_amount, 2)

    folio = db.query(Folio).filter(Folio.reservation_id == reservation_id).first()
    if not folio:
        folio = Folio(
            reservation_id=reservation_id,
            room_charges=room_charges,
            tax_amount=tax_amount,
            total_due=total_due,
            payment_status="Pending",
            key_card_assigned=key_card,
        )
        db.add(folio)
    else:
        folio.room_charges = room_charges
        folio.tax_amount = tax_amount
        folio.total_due = total_due
        folio.key_card_assigned = key_card

    db.commit()
    db.refresh(folio)
    return folio


@router.post("/{reservation_id}/check-out", response_model=FolioResponse)
def check_out(
    reservation_id: UUID,
    req: CheckOutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    if res.status != "Checked-In":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot check out reservation with status '{res.status}'. Must be 'Checked-In'.",
        )

    room = db.query(Room).filter(Room.id == res.room_id).first()
    folio = db.query(Folio).filter(Folio.reservation_id == reservation_id).first()
    if not folio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Folio not found"
        )

    # Process settlement
    folio.payment_status = "Paid"
    folio.payment_method = req.payment_method

    # Update statuses
    res.status = "Checked-Out"
    if room:
        room.status = "Cleaning"

    db.commit()
    db.refresh(folio)
    return folio
