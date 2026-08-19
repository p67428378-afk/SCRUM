from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.models import User, UserActivityLog, UserLoginStats
from server.schemas.schemas import UserActivityLogList, UserLoginStatsResponse
from server.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/activity", tags=["Activity"])


@router.get("/logs", response_model=UserActivityLogList)
def get_activity_logs(
    user_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(UserActivityLog)

    # Regular users can only see their own logs unless specified and admin
    target_user_id = (
        user_id if (current_user.role == "admin" and user_id) else current_user.id
    )
    query = query.filter(UserActivityLog.user_id == target_user_id)

    if activity_type:
        query = query.filter(UserActivityLog.activity_type == activity_type)

    total = query.count()
    items = (
        query.order_by(UserActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/summary", response_model=UserLoginStatsResponse)
def get_activity_summary(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user_id = (
        user_id if (current_user.role == "admin" and user_id) else current_user.id
    )
    stats = (
        db.query(UserLoginStats)
        .filter(UserLoginStats.user_id == target_user_id)
        .first()
    )

    if not stats:
        return UserLoginStatsResponse(
            id=None,
            user_id=target_user_id,
            login_count=0,
            pricing_tier="Free",
            last_login_at=None,
            updated_at=None,
        )

    return stats
