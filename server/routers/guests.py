from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Guest, User
from server.schemas import GuestCreate, GuestUpdate, GuestResponse
from server.auth import require_roles

router = APIRouter(prefix="/api/v1/guests", tags=["Guests"])


@router.get("", response_model=List[GuestResponse])
def list_guests(
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    query = db.query(Guest)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Guest.full_name.ilike(pattern))
            | (Guest.email.ilike(pattern))
            | (Guest.phone.ilike(pattern))
        )
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
def create_guest(
    guest_in: GuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    guest = Guest(
        full_name=guest_in.full_name,
        email=guest_in.email,
        phone=guest_in.phone,
        id_proof_number=guest_in.id_proof_number,
    )
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.get("/{guest_id}", response_model=GuestResponse)
def get_guest(
    guest_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found"
        )
    return guest


@router.put("/{guest_id}", response_model=GuestResponse)
def update_guest(
    guest_id: UUID,
    guest_in: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found"
        )

    if guest_in.full_name is not None:
        guest.full_name = guest_in.full_name
    if guest_in.email is not None:
        guest.email = guest_in.email
    if guest_in.phone is not None:
        guest.phone = guest_in.phone
    if guest_in.id_proof_number is not None:
        guest.id_proof_number = guest_in.id_proof_number

    db.commit()
    db.refresh(guest)
    return guest
