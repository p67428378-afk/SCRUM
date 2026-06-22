"""
Module: routers.maintenance
Purpose: API router for Maintenance requests
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.maintenance import MaintenanceRequest
from server.app.models.resident import Resident
from server.app.schemas.maintenance import (
    MaintenanceRequestCreate,
    MaintenanceRequestResponse,
)

router = APIRouter(prefix="/api/v1/maintenance-requests", tags=["maintenance"])


@router.post(
    "", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED
)
def create_maintenance_request(
    payload: MaintenanceRequestCreate, db: Session = Depends(get_db)
):
    """
    Submit a new maintenance request.
    """
    # Validate resident exists
    resident = db.query(Resident).filter(Resident.id == payload.resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Resident not found"
        )

    if not payload.category or not payload.description or not payload.priority:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required fields"
        )

    try:
        new_request = MaintenanceRequest(
            resident_id=payload.resident_id,
            category=payload.category,
            description=payload.description,
            priority=payload.priority,
            image_url=payload.image_url,
            status="Pending",
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return new_request
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{id}", response_model=MaintenanceRequestResponse)
def get_maintenance_request(id: str, db: Session = Depends(get_db)):
    """
    Get maintenance request details.
    """
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        )
    return request
