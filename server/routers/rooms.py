from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from server.database import get_db
from server.models.room import Room
from server.schemas.room import RoomResponse, RoomStatusUpdate
from server.routers.auth import get_current_user, check_role

router = APIRouter(prefix="/api/v1/rooms", tags=["rooms"])


@router.get("", response_model=List[RoomResponse])
def get_rooms(
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Room)
    if status:
        query = query.filter(Room.status == status)
    if type:
        query = query.filter(Room.type == type)
    return query.all()


@router.put("/{room_id}/status", response_model=RoomResponse)
def update_room_status(
    room_id: str,
    status_update: RoomStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator", "Manager", "Receptionist"])),
):
    valid_statuses = ["Available", "Occupied", "Dirty"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value. Must be one of {valid_statuses}",
        )

    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
        )

    room.status = status_update.status
    db.commit()
    db.refresh(room)
    return room
