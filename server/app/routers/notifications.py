from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from server.app.database import get_db
from server.app.models import Notification, Guide
from server.app.schemas import NotificationResponse, NotificationReadResponse
from server.app.auth import get_current_guide

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_guide: Guide = Depends(get_current_guide), db: Session = Depends(get_db)
):
    return (
        db.query(Notification)
        .filter(Notification.guide_id == current_guide.guide_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.post("/{notification_id}/read", response_model=NotificationReadResponse)
def read_notification(
    notification_id: str,
    current_guide: Guide = Depends(get_current_guide),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id == notification_id,
            Notification.guide_id == current_guide.guide_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification
