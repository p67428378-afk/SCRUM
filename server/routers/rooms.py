from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Room, User
from server.schemas import RoomCreate, RoomUpdate, RoomResponse
from server.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])


@router.get("", response_model=List[RoomResponse])
def list_rooms(
    room_type: Optional[str] = Query(None, description="Filter by room type"),
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by status"
    ),
    capacity: Optional[int] = Query(None, description="Filter by minimum capacity"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Room)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    if status_filter:
        query = query.filter(Room.status == status_filter)
    if capacity:
        query = query.filter(Room.capacity >= capacity)

    rooms = query.offset(skip).limit(limit).all()
    return rooms


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Front Desk Staff"])),
):
    existing = db.query(Room).filter(Room.room_number == room_in.room_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room number {room_in.room_number} already exists",
        )

    room = Room(
        room_number=room_in.room_number,
        room_type=room_in.room_type,
        capacity=room_in.capacity,
        base_rate_per_night=room_in.base_rate_per_night,
        status=room_in.status,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
        )
    return room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: UUID,
    room_in: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
        )

    # Housekeeping role restrictions
    if current_user.role == "Housekeeping":
        # Housekeeping can only update status
        if room_in.room_type or room_in.capacity or room_in.base_rate_per_night:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Housekeeping can only update room status, not rates or types",
            )

    if room_in.room_type is not None:
        room.room_type = room_in.room_type
    if room_in.capacity is not None:
        room.capacity = room_in.capacity
    if room_in.base_rate_per_night is not None:
        room.base_rate_per_night = room_in.base_rate_per_night
    if room_in.status is not None:
        room.status = room_in.status

    db.commit()
    db.refresh(room)
    return room
