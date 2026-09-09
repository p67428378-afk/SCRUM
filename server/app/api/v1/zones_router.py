from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.schemas.zone import ZoneCreate, ZoneResponse, PaginatedZonesResponse
from server.app.schemas.utility_metric import UtilityMetricCreate, UtilityMetricResponse
from server.app.services.zone_service import ZoneService

router = APIRouter(prefix="/zones", tags=["Zones & Utility Metrics"])


@router.get("", response_model=PaginatedZonesResponse)
def list_zones(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    items, total = ZoneService.get_zones(db, skip=skip, limit=limit, status=status)
    return PaginatedZonesResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    zone_in: ZoneCreate,
    db: Session = Depends(get_db),
):
    existing = ZoneService.get_zone_by_code(db, zone_in.zone_code)
    if existing:
        raise HTTPException(
            status_code=400, detail="Zone with this code already exists"
        )
    return ZoneService.create_zone(db, zone_in)


@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(
    zone_id: str,
    db: Session = Depends(get_db),
):
    zone = ZoneService.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.get("/{zone_id}/utility-metrics", response_model=List[UtilityMetricResponse])
def get_zone_utility_metrics(
    zone_id: str,
    db: Session = Depends(get_db),
):
    zone = ZoneService.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return ZoneService.get_utility_metrics_for_zone(db, zone_id)


@router.post(
    "/{zone_id}/utility-metrics",
    response_model=UtilityMetricResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_zone_utility_metric(
    zone_id: str,
    metric_in: UtilityMetricCreate,
    db: Session = Depends(get_db),
):
    zone = ZoneService.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return ZoneService.add_utility_metric(db, zone_id, metric_in)
