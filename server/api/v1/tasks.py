from typing import Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from server.database import get_db
from server.dependencies.auth import get_current_user
from server.models.user import User
from server.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from server.services.task_service import (
    create_task,
    get_task_by_id,
    update_task,
    delete_task,
    get_tasks_paginated,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    tag_filter: Optional[str] = Query(None, alias="tag"),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc", pattern="^(asc|desc|ASC|DESC)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if status_filter and status_filter not in ["Pending", "In Progress", "Completed"]:
        raise HTTPException(status_code=422, detail="Invalid status filter")
    if priority_filter and priority_filter not in ["Low", "Medium", "High", "Urgent"]:
        raise HTTPException(status_code=422, detail="Invalid priority filter")
    if sort_by not in [
        "created_at",
        "updated_at",
        "due_date",
        "priority",
        "status",
        "title",
    ]:
        raise HTTPException(status_code=422, detail="Invalid sort_by field")

    tasks, total = get_tasks_paginated(
        db=db,
        user_id=current_user.id,
        status_filter=status_filter,
        priority_filter=priority_filter,
        tag_filter=tag_filter,
        search=search,
        sort_by=sort_by,
        order=order,
        skip=skip,
        limit=limit,
    )
    return TaskListResponse(items=tasks, total=total, skip=skip, limit=limit)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_task(db=db, user_id=current_user.id, task_in=task_in)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_task_by_id(db=db, user_id=current_user.id, task_id=task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_existing_task(
    task_id: str,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_task(db=db, user_id=current_user.id, task_id=task_id, task_in=task_in)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_task(db=db, user_id=current_user.id, task_id=task_id)
    return None
