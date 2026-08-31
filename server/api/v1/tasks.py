import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.models.task import Task
from server.models.project import Project
from server.models.comment import Comment
from server.models.user import User
from server.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskBulkUpdateRequest,
    TaskBulkUpdateResponse,
)
from server.schemas.comment import CommentCreate, CommentResponse
from server.services.escalation import check_and_trigger_escalation
from server.api.v1.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.patch("/bulk-update", response_model=TaskBulkUpdateResponse)
def bulk_update_tasks(
    bulk_in: TaskBulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not bulk_in.task_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="task_ids list cannot be empty",
        )

    # Perform atomic update in single transaction
    try:
        tasks = db.query(Task).filter(Task.id.in_(bulk_in.task_ids)).all()
        found_ids = {t.id for t in tasks}
        missing_ids = [tid for tid in bulk_in.task_ids if tid not in found_ids]

        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task IDs not found: {missing_ids}",
            )

        updated_tasks = []
        now = datetime.now(timezone.utc)
        for task in tasks:
            task.status = bulk_in.status
            task.updated_at = now
            # Check escalation trigger on status/due_date change
            check_and_trigger_escalation(db, task)
            updated_tasks.append(task)

        db.commit()
        for task in updated_tasks:
            db.refresh(task)

        return TaskBulkUpdateResponse(
            updated_count=len(updated_tasks),
            tasks=[TaskResponse.model_validate(t) for t in updated_tasks],
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to bulk update tasks: {str(e)}",
        )


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    assignee_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == task_in.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Referenced project '{task_in.project_id}' does not exist",
        )

    now = datetime.now(timezone.utc)
    task = Task(
        id=str(uuid.uuid4()),
        project_id=task_in.project_id,
        summary=task_in.summary,
        description=task_in.description,
        priority=task_in.priority,
        status=task_in.status,
        assignee_id=task_in.assignee_id,
        due_date=task_in.due_date,
        created_at=now,
        updated_at=now,
    )
    db.add(task)

    # Check escalation trigger
    check_and_trigger_escalation(db, task)

    db.commit()
    db.refresh(task)
    return task


@router.get("/{id}", response_model=TaskResponse)
def get_task(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put("/{id}", response_model=TaskResponse)
def update_task(
    id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    task.updated_at = datetime.now(timezone.utc)

    # Check escalation trigger
    check_and_trigger_escalation(db, task)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()
    return None


@router.get("/{id}/comments", response_model=List[CommentResponse])
def get_task_comments(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    comments = (
        db.query(Comment)
        .filter(Comment.task_id == id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return comments


@router.post(
    "/{id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task_comment(
    id: str,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    now = datetime.now(timezone.utc)
    comment = Comment(
        id=str(uuid.uuid4()),
        task_id=id,
        author_id=current_user.id,
        body=comment_in.body,
        created_at=now,
        updated_at=now,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
