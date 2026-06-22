"""
Module: routers.facility
Purpose: API router for Facilities and Bookings
"""

from datetime import datetime, time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.facility import Facility, Booking
from server.app.models.resident import Resident
from server.app.schemas.facility import (
    FacilityResponse,
    AvailabilityResponse,
    BookingCreate,
    BookingResponse,
)

router = APIRouter(prefix="/api/v1", tags=["facilities"])


@router.get("/facilities", response_model=List[FacilityResponse])
def get_facilities(db: Session = Depends(get_db)):
    """
    Get list of facilities.
    """
    return db.query(Facility).all()


@router.get("/facilities/{id}/availability", response_model=List[AvailabilityResponse])
def get_facility_availability(id: str, date: str, db: Session = Depends(get_db)):
    """
    Get facility availability for a specific date (YYYY-MM-DD).
    """
    facility = db.query(Facility).filter(Facility.id == id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found"
        )

    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD",
        )

    # Define standard 2-hour slots from 08:00 to 22:00
    slots = []
    start_hour = 8
    end_hour = 22
    slot_duration = 2

    # Fetch all bookings for this facility on the target date
    bookings = (
        db.query(Booking)
        .filter(Booking.facility_id == id, Booking.status != "Cancelled")
        .all()
    )

    for hour in range(start_hour, end_hour, slot_duration):
        slot_start = datetime.combine(target_date, time(hour, 0))
        slot_end = datetime.combine(target_date, time(hour + slot_duration, 0))

        # Check if any booking overlaps with this slot
        available = True
        for b in bookings:
            # Ensure timezone-naive comparison
            b_start = (
                b.start_time.replace(tzinfo=None)
                if b.start_time.tzinfo
                else b.start_time
            )
            b_end = b.end_time.replace(tzinfo=None) if b.end_time.tzinfo else b.end_time
            if b_start < slot_end and b_end > slot_start:
                available = False
                break

        slots.append(
            {"start_time": slot_start, "end_time": slot_end, "available": available}
        )

    return slots


@router.post(
    "/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED
)
def book_facility(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Book a facility.
    """
    facility = db.query(Facility).filter(Facility.id == payload.facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Facility not found"
        )

    resident = db.query(Resident).filter(Resident.id == payload.resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Resident not found"
        )

    # Ensure timezone-naive comparison
    start_time = (
        payload.start_time.replace(tzinfo=None)
        if payload.start_time.tzinfo
        else payload.start_time
    )
    end_time = (
        payload.end_time.replace(tzinfo=None)
        if payload.end_time.tzinfo
        else payload.end_time
    )

    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    # Check for double booking
    overlapping_booking = (
        db.query(Booking)
        .filter(
            Booking.facility_id == payload.facility_id, Booking.status != "Cancelled"
        )
        .all()
    )

    for b in overlapping_booking:
        b_start = (
            b.start_time.replace(tzinfo=None) if b.start_time.tzinfo else b.start_time
        )
        b_end = b.end_time.replace(tzinfo=None) if b.end_time.tzinfo else b.end_time
        if b_start < end_time and b_end > start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Double booking or invalid time slot",
            )

    try:
        new_booking = Booking(
            facility_id=payload.facility_id,
            resident_id=payload.resident_id,
            start_time=start_time,
            end_time=end_time,
            purpose=payload.purpose,
            status="Confirmed",
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        return new_booking
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
