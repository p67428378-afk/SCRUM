from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
from server.app.database import get_db
from server.app.models import Availability, Guide
from server.app.schemas import (
    AvailabilityResponse,
    AvailabilityCreateRequest,
    AvailabilityCreateResponse,
)
from server.app.auth import get_current_guide

router = APIRouter(prefix="/api/v1/availability", tags=["availability"])


@router.get("", response_model=List[AvailabilityResponse])
def get_availability(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    query = db.query(Availability).filter(
        Availability.guide_id == current_guide.guide_id
    )
    if start_date:
        query = query.filter(Availability.date >= start_date)
    if end_date:
        query = query.filter(Availability.date <= end_date)
    return query.all()


@router.post("", response_model=AvailabilityCreateResponse)
def set_availability(
    availability_data: AvailabilityCreateRequest,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    dates_to_update: List[date] = []
    if availability_data.dates:
        dates_to_update = availability_data.dates
    elif availability_data.start_date and availability_data.end_date:
        if availability_data.start_date > availability_data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date cannot be after end_date",
            )
        curr = availability_data.start_date
        while curr <= availability_data.end_date:
            dates_to_update.append(curr)
            curr += timedelta(days=1)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either dates or start_date and end_date must be provided",
        )

    if not dates_to_update:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one date must be provided",
        )

    updated_count = 0
    for d in dates_to_update:
        # Check if availability already exists for this date and guide
        existing = (
            db.query(Availability)
            .filter(
                Availability.guide_id == current_guide.guide_id, Availability.date == d
            )
            .first()
        )

        if existing:
            existing.is_available = availability_data.is_available
            existing.notes = availability_data.notes
        else:
            new_availability = Availability(
                guide_id=current_guide.guide_id,
                date=d,
                is_available=availability_data.is_available,
                notes=availability_data.notes,
            )
            db.add(new_availability)
        updated_count += 1

    db.commit()
    return {"status": "success", "updated_count": updated_count}
