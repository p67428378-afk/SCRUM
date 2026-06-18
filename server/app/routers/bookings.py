from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from server.app.database import get_db
from server.app.models import Booking, Guide, Notification
from server.app.schemas import (
    BookingResponse,
    BookingCreateRequest,
    BookingUpdateRequest,
)
from server.app.auth import get_current_guide

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


@router.get("", response_model=List[BookingResponse])
def get_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).filter(Booking.guide_id == current_guide.guide_id)
    if status:
        query = query.filter(Booking.status == status)
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreateRequest,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    if booking_data.participants <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participants must be greater than 0",
        )

    new_booking = Booking(
        guide_id=current_guide.guide_id,
        client_name=booking_data.client_name,
        client_contact=booking_data.client_contact,
        trek_name=booking_data.trek_name,
        trek_date=booking_data.trek_date,
        participants=booking_data.participants,
        status="Pending",
        payment_status="Pending",
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Create notification for new booking request
    notification = Notification(
        guide_id=current_guide.guide_id,
        message=f"New booking request from {new_booking.client_name} for {new_booking.trek_name}",
        is_read=False,
    )
    db.add(notification)
    db.commit()

    return new_booking


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: str,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id, Booking.guide_id == current_guide.guide_id
        )
        .first()
    )
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: str,
    booking_data: BookingUpdateRequest,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id, Booking.guide_id == current_guide.guide_id
        )
        .first()
    )
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    # Validate input data if needed
    if booking_data.participants is not None and booking_data.participants <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participants must be greater than 0",
        )

    changes = []
    if booking_data.participants is not None:
        if booking.participants != booking_data.participants:
            changes.append(f"participants changed to {booking_data.participants}")
            booking.participants = booking_data.participants
    if booking_data.payment_status is not None:
        if booking.payment_status != booking_data.payment_status:
            changes.append(f"payment status changed to {booking_data.payment_status}")
            booking.payment_status = booking_data.payment_status
    if booking_data.status is not None:
        if booking.status != booking_data.status:
            changes.append(f"status changed to {booking_data.status}")
            booking.status = booking_data.status
    if booking_data.client_name is not None:
        if booking.client_name != booking_data.client_name:
            changes.append(f"client name changed to {booking_data.client_name}")
            booking.client_name = booking_data.client_name
    if booking_data.client_contact is not None:
        if booking.client_contact != booking_data.client_contact:
            changes.append(f"client contact changed to {booking_data.client_contact}")
            booking.client_contact = booking_data.client_contact
    if booking_data.trek_name is not None:
        if booking.trek_name != booking_data.trek_name:
            changes.append(f"trek name changed to {booking_data.trek_name}")
            booking.trek_name = booking_data.trek_name
    if booking_data.trek_date is not None:
        if booking.trek_date != booking_data.trek_date:
            changes.append(f"trek date changed to {booking_data.trek_date}")
            booking.trek_date = booking_data.trek_date

    if changes:
        db.commit()
        db.refresh(booking)

        # Create notification for the change
        notification_msg = f"Booking {booking.booking_id} updated: {', '.join(changes)}"
        notification = Notification(
            guide_id=current_guide.guide_id, message=notification_msg, is_read=False
        )
        db.add(notification)
        db.commit()

    return booking
