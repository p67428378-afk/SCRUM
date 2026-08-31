from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.models.user import User
from server.schemas.analytics import (
    TaskAnalyticsResponse,
    ProductivityAnalyticsResponse,
)
from server.services.analytics import get_task_analytics, get_productivity_analytics
from server.api.v1.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/tasks", response_model=TaskAnalyticsResponse)
def task_analytics(
    project_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_task_analytics(
        db=db,
        project_id=project_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/productivity", response_model=ProductivityAnalyticsResponse)
def productivity_analytics(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_productivity_analytics(
        db=db,
        project_id=project_id,
    )
