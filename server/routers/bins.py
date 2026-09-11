from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from server.database import get_db
from server.models import WasteBin
from server.schemas import (
    WasteBinCreate,
    WasteBinUpdate,
    WasteBinResponse,
    TelemetryUpdate,
)

router = APIRouter(prefix="/bins", tags=["Bins"])


def calculate_status(fill_level_pct: int) -> str:
    if fill_level_pct >= 90:
        return "Overflowing"
    elif fill_level_pct >= 70:
        return "Full"
    elif fill_level_pct >= 26:
        return "Moderate"
    else:
        return "Empty"


@router.get("", response_model=List[WasteBinResponse])
def list_bins(
    zone: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(WasteBin)
    if zone:
        query = query.filter(WasteBin.zone_code == zone)
    if status_filter:
        query = query.filter(WasteBin.status == status_filter)
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=WasteBinResponse, status_code=status.HTTP_201_CREATED)
def create_bin(bin_in: WasteBinCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(WasteBin)
        .filter(WasteBin.serial_number == bin_in.serial_number)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bin serial number already exists")
    fill_level = bin_in.fill_level_pct or 0
    bin_obj = WasteBin(
        id=str(uuid.uuid4()),
        serial_number=bin_in.serial_number,
        location_address=bin_in.location_address,
        zone_code=bin_in.zone_code,
        waste_type=bin_in.waste_type,
        fill_level_pct=fill_level,
        status=calculate_status(fill_level),
    )
    db.add(bin_obj)
    db.commit()
    db.refresh(bin_obj)
    return bin_obj


@router.get("/{bin_id}", response_model=WasteBinResponse)
def get_bin(bin_id: str, db: Session = Depends(get_db)):
    bin_obj = db.query(WasteBin).filter(WasteBin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    return bin_obj


@router.post("/{bin_id}/telemetry", response_model=WasteBinResponse)
def update_telemetry(
    bin_id: str, telemetry: TelemetryUpdate, db: Session = Depends(get_db)
):
    bin_obj = db.query(WasteBin).filter(WasteBin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Waste bin not found")

    bin_obj.fill_level_pct = telemetry.fill_level_pct
    bin_obj.status = calculate_status(telemetry.fill_level_pct)
    db.commit()
    db.refresh(bin_obj)
    return bin_obj


@router.patch("/{bin_id}", response_model=WasteBinResponse)
def update_bin(bin_id: str, bin_update: WasteBinUpdate, db: Session = Depends(get_db)):
    bin_obj = db.query(WasteBin).filter(WasteBin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Waste bin not found")

    if bin_update.location_address is not None:
        bin_obj.location_address = bin_update.location_address
    if bin_update.zone_code is not None:
        bin_obj.zone_code = bin_update.zone_code
    if bin_update.waste_type is not None:
        bin_obj.waste_type = bin_update.waste_type
    if bin_update.fill_level_pct is not None:
        bin_obj.fill_level_pct = bin_update.fill_level_pct
        bin_obj.status = calculate_status(bin_update.fill_level_pct)
    elif bin_update.status is not None:
        bin_obj.status = bin_update.status

    db.commit()
    db.refresh(bin_obj)
    return bin_obj
