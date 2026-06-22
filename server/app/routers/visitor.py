"""
Module: routers.visitor
Purpose: API router for Visitor management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.visitor import Visitor
from server.app.models.resident import Resident
from server.app.schemas.visitor import VisitorPreApprove, VisitorResponse

router = APIRouter(prefix="/api/v1/visitors", tags=["visitors"])


@router.post(
    "/pre-approve", response_model=VisitorResponse, status_code=status.HTTP_201_CREATED
)
def pre_approve_visitor(payload: VisitorPreApprove, db: Session = Depends(get_db)):
    """
    Pre-approve a visitor.
    """
    resident = db.query(Resident).filter(Resident.id == payload.resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Resident not found"
        )

    try:
        new_visitor = Visitor(
            resident_id=payload.resident_id,
            name=payload.name,
            expected_arrival=payload.expected_arrival.replace(tzinfo=None)
            if payload.expected_arrival.tzinfo
            else payload.expected_arrival,
            status="Expected",
        )
        db.add(new_visitor)
        db.commit()
        db.refresh(new_visitor)
        return new_visitor
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/log", response_model=List[VisitorResponse])
def get_visitor_log(resident_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get visitor log.
    """
    query = db.query(Visitor)
    if resident_id:
        query = query.filter(Visitor.resident_id == resident_id)
    return query.order_by(Visitor.expected_arrival.desc()).all()
