from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestStatusUpdate,
    PaginatedServiceRequestsResponse,
)
from server.app.services.service_request_service import ServiceRequestService

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])


@router.post(
    "", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED
)
def create_service_request(
    request_in: ServiceRequestCreate,
    db: Session = Depends(get_db),
):
    return ServiceRequestService.create_service_request(db, request_in)


@router.get("", response_model=PaginatedServiceRequestsResponse)
def list_service_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    items, total = ServiceRequestService.get_service_requests(
        db,
        skip=skip,
        limit=limit,
        status=status,
        zone_id=zone_id,
        category=category,
        priority=priority,
    )
    return PaginatedServiceRequestsResponse(
        items=items, total=total, skip=skip, limit=limit
    )


@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_service_request(
    request_id: str,
    db: Session = Depends(get_db),
):
    srv_req = ServiceRequestService.get_service_request_by_id(db, request_id)
    if not srv_req:
        raise HTTPException(status_code=404, detail="Service request not found")
    return srv_req


@router.patch("/{request_id}/status", response_model=ServiceRequestResponse)
def update_service_request_status(
    request_id: str,
    status_update: ServiceRequestStatusUpdate,
    db: Session = Depends(get_db),
):
    updated_req = ServiceRequestService.update_service_request_status(
        db, request_id, status_update
    )
    if not updated_req:
        raise HTTPException(status_code=404, detail="Service request not found")
    return updated_req
