from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import MediaItem, User, Watchlist
from server.schemas import SearchResponse, MediaItemResponse
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search_media(
    q: Optional[str] = Query(
        None, description="Search query across title, description, genre, or cast"
    ),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    type: Optional[str] = Query(
        None, description="Filter by type ('movie' or 'series')"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MediaItem)

    if current_user.role != "admin":
        query = query.filter(MediaItem.is_published == True)

    if type:
        query = query.filter(MediaItem.type == type)

    if genre:
        query = query.filter(MediaItem.genre.ilike(f"%{genre}%"))

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                MediaItem.title.ilike(search_term),
                MediaItem.description.ilike(search_term),
                MediaItem.genre.ilike(search_term),
                MediaItem.cast_members.ilike(search_term),
            )
        )

    total = query.count()
    results = query.offset(skip).limit(limit).all()

    return {"results": results, "total": total}


@router.get("/recommendations", response_model=List[MediaItemResponse])
def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get personalized or trending recommendations for the current user.
    """
    # Fetch user's watchlist genres to personalize
    user_watchlist = (
        db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    )
    watchlist_media_ids = [w.media_item_id for w in user_watchlist]

    query = db.query(MediaItem).filter(MediaItem.is_published == True)

    # Exclude items already in watchlist if possible
    if watchlist_media_ids:
        query = query.filter(MediaItem.id.notin_(watchlist_media_ids))

    recommendations = query.limit(limit).all()
    if not recommendations:
        # Fallback to all published media if watchlist has everything
        recommendations = (
            db.query(MediaItem)
            .filter(MediaItem.is_published == True)
            .limit(limit)
            .all()
        )

    return recommendations
