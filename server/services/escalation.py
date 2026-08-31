import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from server.models.task import Task
from server.models.project import Project
from server.models.user import User
from server.models.escalation import EscalationLog


def check_and_trigger_escalation(
    db: Session, task: Task, custom_reason: Optional[str] = None
) -> Optional[EscalationLog]:
    """
    Checks if a task qualifies for an escalation trigger (High/Urgent priority or overdue).
    If triggered, resolves the designated project admin (or fallback system admin)
    and records an EscalationLog entry.
    """
    now = datetime.now(timezone.utc)
    is_high_priority = task.priority in ["High", "Urgent"]

    # Task due date comparison (making naive UTC if needed)
    is_overdue = False
    if task.due_date:
        task_due = task.due_date
        if task_due.tzinfo is None:
            task_due = task_due.replace(tzinfo=timezone.utc)
        if task_due < now and task.status != "Done":
            is_overdue = True

    if not (is_high_priority or is_overdue):
        return None

    reason = custom_reason
    if not reason:
        reasons = []
        if is_high_priority:
            reasons.append(f"High-priority escalation: priority is '{task.priority}'")
        if is_overdue:
            reasons.append(
                f"Due-date escalation: task is past due date ({task.due_date})"
            )
        reason = "; ".join(reasons)

    # Find project and owner
    project = db.query(Project).filter(Project.id == task.project_id).first()
    notified_admin_id = None

    if project and project.owner_id:
        owner = db.query(User).filter(User.id == project.owner_id).first()
        if owner and owner.role == "Admin":
            notified_admin_id = owner.id

    # Fallback to system-wide Admin if project owner is not an Admin
    if not notified_admin_id:
        system_admin = (
            db.query(User)
            .filter(User.role == "Admin", User.is_active == True)
            .order_by(User.created_at.asc())
            .first()
        )
        if system_admin:
            notified_admin_id = system_admin.id

    escalation_log = EscalationLog(
        id=str(uuid.uuid4()),
        task_id=task.id,
        project_id=task.project_id,
        priority=task.priority,
        reason=reason,
        notified_admin_id=notified_admin_id,
        created_at=now,
    )
    db.add(escalation_log)
    return escalation_log
