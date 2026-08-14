from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies.auth import get_current_user
from server.models.user import User
from server.schemas.dashboard import DashboardStats
from server.services.dashboard_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_dashboard_stats(db=db, user_id=current_user.id)
