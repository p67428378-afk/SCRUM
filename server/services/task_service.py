from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc, cast, String
from fastapi import HTTPException, status

from server.models.task import Task
from server.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, user_id: str, task_in: TaskCreate) -> Task:
    task = Task(
        user_id=user_id,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        due_date=task_in.due_date,
        tags=task_in.tags or [],
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task_by_id(db: Session, user_id: str, task_id: str) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


def update_task(db: Session, user_id: str, task_id: str, task_in: TaskUpdate) -> Task:
    task = get_task_by_id(db, user_id, task_id)
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, user_id: str, task_id: str) -> None:
    task = get_task_by_id(db, user_id, task_id)
    db.delete(task)
    db.commit()


def get_tasks_paginated(
    db: Session,
    user_id: str,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    tag_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[Task], int]:
    query = db.query(Task).filter(Task.user_id == user_id)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern), Task.description.ilike(search_pattern)
            )
        )
    if tag_filter:
        query = query.filter(cast(Task.tags, String).contains(tag_filter))

    total = query.count()

    sort_column = getattr(Task, sort_by, Task.created_at)
    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    tasks = query.offset(skip).limit(limit).all()
    return tasks, total
