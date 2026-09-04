from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from server.database import get_db
from server.models import Watchlist, MediaItem, User
from server.schemas import WatchlistCreate, WatchlistResponse
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/watchlist", tags=["watchlist"])


@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    watchlist_items = (
        db.query(Watchlist)
        .filter(Watchlist.user_id == current_user.id)
        .order_by(Watchlist.created_at.desc())
        .all()
    )
    return watchlist_items


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_200_OK)
def add_to_watchlist(
    item_in: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if media item exists
    media_item = (
        db.query(MediaItem).filter(MediaItem.id == item_in.media_item_id).first()
    )
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found"
        )

    # Check for existing watchlist item (idempotency requirement)
    existing = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.media_item_id == item_in.media_item_id,
        )
        .first()
    )
    if existing:
        return existing

    watchlist_entry = Watchlist(
        user_id=current_user.id, media_item_id=item_in.media_item_id
    )
    db.add(watchlist_entry)
    try:
        db.commit()
        db.refresh(watchlist_entry)
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(Watchlist)
            .filter(
                Watchlist.user_id == current_user.id,
                Watchlist.media_item_id == item_in.media_item_id,
            )
            .first()
        )
        return existing

    return watchlist_entry


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    media_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id, Watchlist.media_item_id == media_id
        )
        .first()
    )
    if entry:
        db.delete(entry)
        db.commit()
    return None
