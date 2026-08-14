from datetime import datetime, timezone
from sqlalchemy.orm import Session

from server.models.task import Task
from server.schemas.dashboard import DashboardStats


def get_dashboard_stats(db: Session, user_id: str) -> DashboardStats:
    now = datetime.now(timezone.utc)
    user_tasks = db.query(Task).filter(Task.user_id == user_id).all()

    total = len(user_tasks)
    completed = sum(1 for t in user_tasks if t.status == "Completed")
    in_progress = sum(1 for t in user_tasks if t.status == "In Progress")

    overdue = 0
    for t in user_tasks:
        if t.status != "Completed" and t.due_date is not None:
            dt = t.due_date
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt < now:
                overdue += 1

    completion_rate = round((completed / total) * 100.0, 2) if total > 0 else 0.0

    return DashboardStats(
        total=total,
        completed=completed,
        in_progress=in_progress,
        overdue=overdue,
        completion_rate=completion_rate,
    )
