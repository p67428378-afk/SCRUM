from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.schemas.citizen import CitizenCreate, CitizenResponse
from server.app.services.citizen_service import CitizenService

router = APIRouter(prefix="/citizens", tags=["Citizens"])


@router.post("", response_model=CitizenResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(
    citizen_in: CitizenCreate,
    db: Session = Depends(get_db),
):
    existing = CitizenService.get_citizen_by_email(db, citizen_in.email)
    if existing:
        raise HTTPException(
            status_code=400, detail="Citizen with this email already registered"
        )
    return CitizenService.create_citizen(db, citizen_in)


@router.get("", response_model=List[CitizenResponse])
def list_citizens(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return CitizenService.get_citizens(db, skip=skip, limit=limit)


@router.get("/{citizen_id}", response_model=CitizenResponse)
def get_citizen(
    citizen_id: str,
    db: Session = Depends(get_db),
):
    citizen = CitizenService.get_citizen_by_id(db, citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return citizen
