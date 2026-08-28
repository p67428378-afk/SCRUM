from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.models import UserActivityLog

router = APIRouter(prefix="/api/v1/activity", tags=["activity"])


@router.get("")
def get_activity_logs(db: Session = Depends(get_db)):
    return (
        db.query(UserActivityLog)
        .order_by(UserActivityLog.created_at.desc())
        .limit(50)
        .all()
    )
