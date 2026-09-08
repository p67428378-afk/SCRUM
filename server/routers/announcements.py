from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user, require_role

router = APIRouter()


@router.get("", response_model=List[schemas.AnnouncementResponse])
def list_announcements(
    urgency: Optional[str] = Query(
        None, description="Filter by urgency level (Info, Warning, Emergency)"
    ),
    include_archived: bool = Query(False, description="Include archived announcements"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Announcement)
    if not include_archived:
        query = query.filter(models.Announcement.is_archived == False)
    if urgency:
        query = query.filter(models.Announcement.urgency == urgency)

    announcements = (
        query.order_by(models.Announcement.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return announcements


@router.post(
    "", response_model=schemas.AnnouncementResponse, status_code=status.HTTP_201_CREATED
)
def publish_announcement(
    announcement_in: schemas.AnnouncementCreate,
    current_user: models.User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    valid_urgencies = ["Info", "Warning", "Emergency"]
    if announcement_in.urgency not in valid_urgencies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid urgency level. Must be one of: {valid_urgencies}",
        )

    announcement = models.Announcement(
        title=announcement_in.title,
        content=announcement_in.content,
        urgency=announcement_in.urgency or "Info",
        author_id=current_user.id,
        is_archived=False,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/{announcement_id}", response_model=schemas.AnnouncementResponse)
def get_announcement(
    announcement_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    announcement = (
        db.query(models.Announcement)
        .filter(models.Announcement.id == announcement_id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return announcement


@router.patch("/{announcement_id}", response_model=schemas.AnnouncementResponse)
def update_announcement(
    announcement_id: str,
    update_in: schemas.AnnouncementUpdate,
    current_user: models.User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    announcement = (
        db.query(models.Announcement)
        .filter(models.Announcement.id == announcement_id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )

    if update_in.urgency:
        valid_urgencies = ["Info", "Warning", "Emergency"]
        if update_in.urgency not in valid_urgencies:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid urgency level. Must be one of: {valid_urgencies}",
            )

    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(announcement, field, value)

    db.commit()
    db.refresh(announcement)
    return announcement
