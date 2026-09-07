import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.location import Location
from server.models.weather import WeatherRecord
from server.schemas.weather import WeatherRecordCreate, WeatherRecordResponse
from server.services.alert_engine import evaluate_alerts_for_reading

router = APIRouter(prefix="/api/v1/weather", tags=["weather"])


@router.post(
    "", response_model=WeatherRecordResponse, status_code=status.HTTP_201_CREATED
)
def ingest_weather_record(
    record_in: WeatherRecordCreate, db: Session = Depends(get_db)
):
    loc = db.query(Location).filter(Location.id == record_in.location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{record_in.location_id}' not found.",
        )

    now_utc = datetime.now(timezone.utc)
    rec_time = record_in.recorded_at or now_utc

    new_rec = WeatherRecord(
        id=str(uuid.uuid4()),
        location_id=record_in.location_id,
        temperature_celsius=record_in.temperature_celsius,
        humidity_percent=record_in.humidity_percent,
        wind_speed_mph=record_in.wind_speed_mph,
        wind_direction=record_in.wind_direction,
        precipitation_inches=record_in.precipitation_inches,
        pressure_hpa=record_in.pressure_hpa,
        uv_index=record_in.uv_index,
        recorded_at=rec_time,
        created_at=now_utc,
    )

    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)

    # Evaluate alert configurations against this reading
    evaluate_alerts_for_reading(db, new_rec)

    return new_rec


@router.get("/current", response_model=WeatherRecordResponse)
def get_current_weather(
    location_id: str = Query(..., description="UUID of location"),
    db: Session = Depends(get_db),
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )

    rec = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.location_id == location_id)
        .order_by(WeatherRecord.recorded_at.desc())
        .first()
    )

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No weather readings available for this location.",
        )

    return rec


@router.get("/history", response_model=List[WeatherRecordResponse])
def get_weather_history(
    location_id: str = Query(..., description="UUID of location"),
    start_date: Optional[datetime] = Query(
        None, description="Start timestamp ISO format"
    ),
    end_date: Optional[datetime] = Query(None, description="End timestamp ISO format"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )

    q = db.query(WeatherRecord).filter(WeatherRecord.location_id == location_id)

    if start_date and end_date:
        # Enforce date range check for > 30 days
        diff = (end_date - start_date).days
        if diff > 30 and limit > 100:
            limit = 100  # Enforce pagination limit

    if start_date:
        q = q.filter(WeatherRecord.recorded_at >= start_date)
    if end_date:
        q = q.filter(WeatherRecord.recorded_at <= end_date)

    records = (
        q.order_by(WeatherRecord.recorded_at.desc()).offset(skip).limit(limit).all()
    )
    return records
