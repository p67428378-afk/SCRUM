from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import random
from server.database import get_db
from server.models import PickupRequest, User
from server.schemas import PickupRequestCreate, PickupRequestResponse
from server.auth import get_current_user

router = APIRouter(prefix="/pickups", tags=["Pickups"])


@router.post(
    "", response_model=PickupRequestResponse, status_code=status.HTTP_201_CREATED
)
def create_pickup_request(
    pickup_in: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tracking_code = f"TRK-{random.randint(1000, 9999)}"
    pickup = PickupRequest(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        tracking_code=tracking_code,
        waste_type=pickup_in.waste_type,
        address=pickup_in.address,
        scheduled_date=pickup_in.scheduled_date,
        time_slot=pickup_in.time_slot,
        special_notes=pickup_in.special_notes,
        status="Confirmed",
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return pickup


@router.get("", response_model=List[PickupRequestResponse])
def list_pickup_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PickupRequest)
    if current_user.role == "Resident":
        query = query.filter(PickupRequest.user_id == current_user.id)
    if status_filter:
        query = query.filter(PickupRequest.status == status_filter)
    return query.offset(skip).limit(limit).all()


@router.get("/{pickup_id}", response_model=PickupRequestResponse)
def get_pickup_request(
    pickup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pickup = db.query(PickupRequest).filter(PickupRequest.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    if current_user.role == "Resident" and pickup.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this request"
        )
    return pickup
