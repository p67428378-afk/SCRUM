from datetime import datetime
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    BackgroundTasks,
    Response,
    Query,
    status,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Task, User
from server.schemas import (
    TaskCreateRequest,
    TaskResponse,
    TaskStatusDetailResponse,
    TaskHistoryResponse,
    TaskHistoryItem,
    TaskErrorDetail,
    LogEntry,
)
from server.auth import get_current_user
from server.services.task_engine import process_task, manager

router = APIRouter(prefix="/api/v1", tags=["Tasks"])


@router.post(
    "/tasks", response_model=TaskResponse, status_code=status.HTTP_202_ACCEPTED
)
def create_task(
    task_in: TaskCreateRequest,
    background_tasks: BackgroundTasks,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    initial_log = {
        "timestamp": now_str,
        "level": "INFO",
        "message": f"Task created and queued for action '{task_in.action_type}'.",
    }

    task = Task(
        user_id=current_user.id,
        action_type=task_in.action_type,
        status="pending",
        logs=[initial_log],
        logs_count=1,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    status_url = f"/api/v1/tasks/{task.id}/status"
    response.headers["Location"] = status_url

    # Trigger async background worker
    background_tasks.add_task(
        process_task, task.id, task_in.action_type, task_in.parameters
    )

    return {
        "task_id": task.id,
        "status": task.status,
        "action_type": task.action_type,
        "created_at": task.created_at,
        "status_url": status_url,
        "logs": task.logs or [],
        "logs_count": task.logs_count or len(task.logs or []),
        "error_code": task.error_code,
        "error_reason": task.error_reason,
    }


@router.get("/tasks/history", response_model=TaskHistoryResponse)
def get_tasks_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    total = query.count()
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for task in tasks:
        items.append(
            TaskHistoryItem(
                task_id=task.id,
                action_type=task.action_type,
                status=task.status,
                error_code=task.error_code,
                error_reason=task.error_reason,
                logs_count=task.logs_count or len(task.logs or []),
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
        )

    return TaskHistoryResponse(items=items, total=total)


@router.get("/tasks/{task_id}/status", response_model=TaskStatusDetailResponse)
@router.get("/tasks/{task_id}", response_model=TaskStatusDetailResponse)
def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found or has expired.",
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access status for this task.",
        )

    now = datetime.utcnow()
    elapsed = max(0.0, (now - task.created_at).total_seconds())
    is_escalated = False
    escalation_message = None

    if task.status == "pending" and elapsed >= 30.0:
        is_escalated = True
        escalation_message = "This operation is taking longer than usual due to processing load. You may safely stay on this page or check back later."

    error_detail = None
    if task.error_code and task.error_reason:
        error_detail = TaskErrorDetail(code=task.error_code, reason=task.error_reason)

    logs_list = [
        LogEntry(
            timestamp=log.get("timestamp", ""),
            level=log.get("level", "INFO"),
            message=log.get("message", ""),
        )
        for log in (task.logs or [])
    ]

    return {
        "task_id": task.id,
        "status": task.status,
        "action_type": task.action_type,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "elapsed_seconds": elapsed,
        "is_escalated": is_escalated,
        "escalation_message": escalation_message,
        "logs": logs_list,
        "logs_count": task.logs_count or len(logs_list),
        "result": task.result,
        "error": error_detail,
        "error_code": task.error_code,
        "error_reason": task.error_reason,
    }


@router.get("/tasks", response_model=List[TaskStatusDetailResponse])
def list_tasks(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    now = datetime.utcnow()
    result_list = []
    for task in tasks:
        elapsed = max(0.0, (now - task.created_at).total_seconds())
        is_escalated = task.status == "pending" and elapsed >= 30.0
        escalation_message = (
            "This operation is taking longer than usual due to processing load."
            if is_escalated
            else None
        )

        error_detail = None
        if task.error_code and task.error_reason:
            error_detail = TaskErrorDetail(
                code=task.error_code, reason=task.error_reason
            )

        logs_list = [
            LogEntry(
                timestamp=log.get("timestamp", ""),
                level=log.get("level", "INFO"),
                message=log.get("message", ""),
            )
            for log in (task.logs or [])
        ]

        result_list.append(
            {
                "task_id": task.id,
                "status": task.status,
                "action_type": task.action_type,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "elapsed_seconds": elapsed,
                "is_escalated": is_escalated,
                "escalation_message": escalation_message,
                "logs": logs_list,
                "logs_count": task.logs_count or len(logs_list),
                "result": task.result,
                "error": error_detail,
                "error_code": task.error_code,
                "error_reason": task.error_reason,
            }
        )
    return result_list


async def websocket_task_status(
    websocket: WebSocket,
    task_id: str,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    await manager.connect(task_id, websocket)
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if task:
            now = datetime.utcnow()
            elapsed = max(0.0, (now - task.created_at).total_seconds())
            is_escalated = task.status == "pending" and elapsed >= 30.0
            escalation_message = (
                "This operation is taking longer than usual due to processing load."
                if is_escalated
                else None
            )

            error_detail = None
            if task.error_code and task.error_reason:
                error_detail = {"code": task.error_code, "reason": task.error_reason}

            initial_payload = {
                "event": "TASK_STATUS_UPDATE",
                "task_id": task.id,
                "status": task.status,
                "updated_at": task.updated_at.isoformat(),
                "elapsed_seconds": elapsed,
                "is_escalated": is_escalated,
                "escalation_message": escalation_message,
                "logs": task.logs or [],
                "result": task.result,
                "error": error_detail,
                "error_reason": task.error_reason,
            }
            await websocket.send_json(initial_payload)

        # Keep connection open for incoming messages / heartbeats
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(task_id, websocket)
    except Exception:
        manager.disconnect(task_id, websocket)
