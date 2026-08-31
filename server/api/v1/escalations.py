from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.models.escalation import EscalationLog
from server.models.user import User
from server.schemas.escalation import EscalationLogResponse
from server.api.v1.auth import get_current_user

router = APIRouter(prefix="/escalations", tags=["escalations"])


@router.get("", response_model=List[EscalationLogResponse])
def list_escalations(
    project_id: Optional[str] = Query(None),
    task_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(EscalationLog)
    if project_id:
        query = query.filter(EscalationLog.project_id == project_id)
    if task_id:
        query = query.filter(EscalationLog.task_id == task_id)

    logs = (
        query.order_by(EscalationLog.created_at.desc()).offset(skip).limit(limit).all()
    )
    return logs
