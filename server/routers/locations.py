import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.location import Location
from server.models.weather import WeatherRecord
from server.schemas.location import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])


def compute_station_status(db: Session, location: Location) -> str:
    """
    Computes whether a station is ACTIVE or Data Unavailable / Offline.
    If no record exists or last record is older than 10 minutes, status is 'Data Unavailable / Offline'.
    """
    latest_rec = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.location_id == location.id)
        .order_by(WeatherRecord.recorded_at.desc())
        .first()
    )

    if not latest_rec:
        return "Data Unavailable / Offline"

    now_utc = datetime.now(timezone.utc)
    rec_time = latest_rec.recorded_at
    if rec_time.tzinfo is None:
        rec_time = rec_time.replace(tzinfo=timezone.utc)

    if (now_utc - rec_time).total_seconds() > 600:  # > 10 minutes
        return "Data Unavailable / Offline"

    return location.status or "ACTIVE"


@router.get("", response_model=List[LocationResponse])
def list_locations(
    query: Optional[str] = Query(
        None, description="Search by name, city, state, or country"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Location)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (Location.name.ilike(search_pattern))
            | (Location.city.ilike(search_pattern))
            | (Location.state.ilike(search_pattern))
            | (Location.country.ilike(search_pattern))
        )

    locations = q.offset(skip).limit(limit).all()

    result = []
    for loc in locations:
        latest_rec = (
            db.query(WeatherRecord)
            .filter(WeatherRecord.location_id == loc.id)
            .order_by(WeatherRecord.recorded_at.desc())
            .first()
        )

        last_record_at = latest_rec.recorded_at if latest_rec else None
        current_status = compute_station_status(db, loc)

        loc_resp = LocationResponse(
            id=loc.id,
            name=loc.name,
            city=loc.city,
            state=loc.state,
            country=loc.country,
            latitude=loc.latitude,
            longitude=loc.longitude,
            elevation_meters=loc.elevation_meters,
            status=current_status,
            created_at=loc.created_at,
            updated_at=loc.updated_at,
            last_record_at=last_record_at,
        )
        result.append(loc_resp)

    return result


@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(location_in: LocationCreate, db: Session = Depends(get_db)):
    # GPS coordinate validation
    if not (-90.0 <= location_in.latitude <= 90.0) or not (
        -180.0 <= location_in.longitude <= 180.0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GPS coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.",
        )

    # Check for duplicate station name
    existing = db.query(Location).filter(Location.name == location_in.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Station with name '{location_in.name}' already exists.",
        )

    now_utc = datetime.now(timezone.utc)
    new_loc = Location(
        id=str(uuid.uuid4()),
        name=location_in.name,
        city=location_in.city,
        state=location_in.state,
        country=location_in.country,
        latitude=location_in.latitude,
        longitude=location_in.longitude,
        elevation_meters=location_in.elevation_meters,
        status="ACTIVE",
        created_at=now_utc,
        updated_at=now_utc,
    )

    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)

    return LocationResponse(
        id=new_loc.id,
        name=new_loc.name,
        city=new_loc.city,
        state=new_loc.state,
        country=new_loc.country,
        latitude=new_loc.latitude,
        longitude=new_loc.longitude,
        elevation_meters=new_loc.elevation_meters,
        status=new_loc.status,
        created_at=new_loc.created_at,
        updated_at=new_loc.updated_at,
        last_record_at=None,
    )


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )

    latest_rec = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.location_id == loc.id)
        .order_by(WeatherRecord.recorded_at.desc())
        .first()
    )

    last_record_at = latest_rec.recorded_at if latest_rec else None
    current_status = compute_station_status(db, loc)

    return LocationResponse(
        id=loc.id,
        name=loc.name,
        city=loc.city,
        state=loc.state,
        country=loc.country,
        latitude=loc.latitude,
        longitude=loc.longitude,
        elevation_meters=loc.elevation_meters,
        status=current_status,
        created_at=loc.created_at,
        updated_at=loc.updated_at,
        last_record_at=last_record_at,
    )


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: str, location_in: LocationUpdate, db: Session = Depends(get_db)
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )

    if location_in.latitude is not None and not (-90.0 <= location_in.latitude <= 90.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid latitude"
        )
    if location_in.longitude is not None and not (
        -180.0 <= location_in.longitude <= 180.0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid longitude"
        )

    for field, val in location_in.dict(exclude_unset=True).items():
        setattr(loc, field, val)

    loc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(loc)

    latest_rec = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.location_id == loc.id)
        .order_by(WeatherRecord.recorded_at.desc())
        .first()
    )

    return LocationResponse(
        id=loc.id,
        name=loc.name,
        city=loc.city,
        state=loc.state,
        country=loc.country,
        latitude=loc.latitude,
        longitude=loc.longitude,
        elevation_meters=loc.elevation_meters,
        status=compute_station_status(db, loc),
        created_at=loc.created_at,
        updated_at=loc.updated_at,
        last_record_at=latest_rec.recorded_at if latest_rec else None,
    )
