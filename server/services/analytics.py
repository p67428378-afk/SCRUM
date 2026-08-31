from datetime import datetime, timezone
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from server.models.task import Task
from server.models.user import User
from server.schemas.analytics import (
    TaskAnalyticsResponse,
    ProductivityAnalyticsResponse,
    UserProductivityItem,
)


def get_task_analytics(
    db: Session,
    project_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> TaskAnalyticsResponse:
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if start_date:
        query = query.filter(Task.created_at >= start_date)
    if end_date:
        query = query.filter(Task.created_at <= end_date)

    tasks = query.all()
    total_tasks = len(tasks)

    status_distribution: Dict[str, int] = {
        "To Do": 0,
        "In Progress": 0,
        "In Review": 0,
        "Done": 0,
    }

    now = datetime.now(timezone.utc)
    completed_tasks = 0
    overdue_tasks = 0

    for task in tasks:
        # Status count
        if task.status in status_distribution:
            status_distribution[task.status] += 1
        else:
            status_distribution[task.status] = 1

        if task.status == "Done":
            completed_tasks += 1
        else:
            if task.due_date:
                due = task.due_date
                if due.tzinfo is None:
                    due = due.replace(tzinfo=timezone.utc)
                if due < now:
                    overdue_tasks += 1

    completion_rate = (
        round((completed_tasks / total_tasks) * 100.0, 2) if total_tasks > 0 else 0.0
    )

    return TaskAnalyticsResponse(
        project_id=project_id,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=completion_rate,
        overdue_tasks=overdue_tasks,
        status_distribution=status_distribution,
    )


def get_productivity_analytics(
    db: Session, project_id: Optional[str] = None
) -> ProductivityAnalyticsResponse:
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)

    tasks = query.all()
    completed_tasks = [t for t in tasks if t.status == "Done"]

    # Calculate average cycle time (created_at to updated_at in days)
    total_cycle_days = 0.0
    for task in completed_tasks:
        created = task.created_at
        updated = task.updated_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if updated.tzinfo is None:
            updated = updated.replace(tzinfo=timezone.utc)

        diff = (updated - created).total_seconds() / 86400.0
        total_cycle_days += max(diff, 0.0)

    avg_cycle_time_days = (
        round(total_cycle_days / len(completed_tasks), 2) if completed_tasks else 0.0
    )

    # Calculate user productivity
    user_counts: Dict[str, int] = {}
    for task in completed_tasks:
        if task.assignee_id:
            user_counts[task.assignee_id] = user_counts.get(task.assignee_id, 0) + 1

    productivity_by_user: List[UserProductivityItem] = []
    if user_counts:
        users = db.query(User).filter(User.id.in_(list(user_counts.keys()))).all()
        user_map = {u.id: u.full_name for u in users}
        for u_id, count in user_counts.items():
            name = user_map.get(u_id, "Unknown User")
            productivity_by_user.append(
                UserProductivityItem(
                    user_id=u_id,
                    user_name=name,
                    tasks_completed=count,
                )
            )

    productivity_by_user.sort(key=lambda x: x.tasks_completed, reverse=True)

    return ProductivityAnalyticsResponse(
        project_id=project_id,
        avg_cycle_time_days=avg_cycle_time_days,
        productivity_by_user=productivity_by_user,
    )
