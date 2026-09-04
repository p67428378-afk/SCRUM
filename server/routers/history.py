from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import WatchHistory, MediaItem, User
from server.schemas import WatchHistoryCreate, WatchHistoryResponse
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/history", tags=["history"])


@router.get("", response_model=List[WatchHistoryResponse])
def get_watch_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    history_items = (
        db.query(WatchHistory)
        .filter(WatchHistory.user_id == current_user.id)
        .order_by(WatchHistory.updated_at.desc())
        .all()
    )
    return history_items


@router.post("", response_model=WatchHistoryResponse)
def update_watch_history(
    history_in: WatchHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify media item exists
    media_item = (
        db.query(MediaItem).filter(MediaItem.id == history_in.media_item_id).first()
    )
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found"
        )

    # Find existing watch history entry
    query = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id,
        WatchHistory.media_item_id == history_in.media_item_id,
    )
    if history_in.episode_id:
        query = query.filter(WatchHistory.episode_id == history_in.episode_id)
    else:
        query = query.filter(WatchHistory.episode_id.is_(None))

    history_entry = query.first()

    if history_entry:
        history_entry.progress_seconds = history_in.progress_seconds
        history_entry.completed = history_in.completed
        history_entry.updated_at = datetime.utcnow()
    else:
        history_entry = WatchHistory(
            user_id=current_user.id,
            media_item_id=history_in.media_item_id,
            episode_id=history_in.episode_id,
            progress_seconds=history_in.progress_seconds,
            completed=history_in.completed,
        )
        db.add(history_entry)

    db.commit()
    db.refresh(history_entry)
    return history_entry
