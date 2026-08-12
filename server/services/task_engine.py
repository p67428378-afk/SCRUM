import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import WebSocket
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

import server.database
from server.models import Task

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, task_id: str, websocket: WebSocket):
        await websocket.accept()
        if task_id not in self.active_connections:
            self.active_connections[task_id] = []
        self.active_connections[task_id].append(websocket)

    def disconnect(self, task_id: str, websocket: WebSocket):
        if task_id in self.active_connections:
            if websocket in self.active_connections[task_id]:
                self.active_connections[task_id].remove(websocket)
            if not self.active_connections[task_id]:
                del self.active_connections[task_id]

    async def broadcast_task_update(self, task_id: str, data: dict):
        if task_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[task_id]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.warning(f"Error sending WS update to task {task_id}: {e}")
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(task_id, conn)


manager = ConnectionManager()


def append_log(task: Task, level: str, message: str) -> dict:
    """
    Appends a structured log entry to task.logs enforcing the 1,000 log line cap.
    Returns the newly created log_entry dict.
    """
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    log_entry = {
        "timestamp": now_str,
        "level": level.upper(),
        "message": message,
    }

    current_logs = list(task.logs or [])
    # Enforce 1,000 max log cap
    if len(current_logs) >= 1000:
        current_logs = current_logs[-999:]

    current_logs.append(log_entry)
    task.logs = current_logs
    task.logs_count = len(current_logs)
    flag_modified(task, "logs")

    return log_entry


async def process_task(
    task_id: str, action_type: str, parameters: Optional[Dict[str, Any]] = None
):
    """
    Background worker function that executes a long-running action,
    appends timestamped log entries, updates task state in DB,
    and broadcasts real-time WebSocket status/log updates.
    """
    params = parameters or {}
    delay = params.get("processing_delay", 0.0)
    should_fail = params.get("should_fail", False)
    custom_error_code = params.get("error_code")
    custom_error_reason = params.get("error_reason")

    db: Session = server.database.SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            logger.error(f"Task {task_id} not found in background worker")
            return

        # 1. Log processing start
        log1 = append_log(
            task,
            "INFO",
            f"Pipeline processing started for action '{action_type}'. Task queued.",
        )
        task.updated_at = datetime.utcnow()
        db.commit()

        await manager.broadcast_task_update(
            task_id,
            {
                "event": "log_update",
                "task_id": task_id,
                "status": task.status,
                "new_log": log1,
            },
        )

        if delay > 0:
            await asyncio.sleep(delay)

        # 2. Log step execution
        log2 = append_log(
            task,
            "INFO",
            "Executing data transformations and validating pipeline constraints...",
        )
        task.updated_at = datetime.utcnow()
        db.commit()

        await manager.broadcast_task_update(
            task_id,
            {
                "event": "log_update",
                "task_id": task_id,
                "status": task.status,
                "new_log": log2,
            },
        )

        # Re-query task to update status
        now = datetime.utcnow()
        task.updated_at = now

        if should_fail or action_type == "failing_task":
            task.status = "failed"
            if custom_error_code and custom_error_reason:
                task.error_code = custom_error_code
                task.error_reason = custom_error_reason
            elif action_type == "payment_processing":
                task.error_code = "PAY_402"
                task.error_reason = "Credit card declined due to insufficient funds (Error Code: PAY_402)."
            elif action_type == "report_generation":
                task.error_code = "RPT_TIMEOUT_504"
                task.error_reason = "Data warehouse query timed out after 30 seconds. Please refine date range filters."
            elif action_type == "file_upload":
                task.error_code = "FILE_FORMAT_400"
                task.error_reason = "Uploaded file format is invalid or corrupted. Please upload a valid PDF or CSV file."
            else:
                task.error_code = "PROC_500"
                task.error_reason = f"Execution failed for action '{action_type}' due to unexpected processing error."

            log_err = append_log(
                task,
                "ERROR",
                f"Task terminated: {task.error_code} - {task.error_reason}",
            )
            error_data = {"code": task.error_code, "reason": task.error_reason}
            result_data = None
            final_log = log_err
        else:
            task.status = "success"
            task.error_code = None
            task.error_reason = None
            if action_type == "report_generation":
                task.result = {
                    "download_url": f"/api/v1/reports/downloads/{task_id}.pdf",
                    "file_size_bytes": 1048576,
                    "generated_at": now.isoformat(),
                }
            elif action_type == "payment_processing":
                task.result = {
                    "transaction_id": f"txn_{task_id[:8]}",
                    "amount": params.get("amount", 99.99),
                    "status": "COMPLETED",
                }
            else:
                task.result = {
                    "message": f"Action '{action_type}' completed successfully.",
                    "details": params,
                }

            log_succ = append_log(
                task,
                "INFO",
                f"Task '{action_type}' completed successfully. All steps finalized.",
            )
            error_data = None
            result_data = task.result
            final_log = log_succ

        db.commit()
        db.refresh(task)

        # Broadcast final status update & log update
        ws_status_payload = {
            "event": "status_change",
            "task_id": task.id,
            "status": task.status,
            "updated_at": task.updated_at.isoformat(),
            "new_log": final_log,
            "logs": task.logs,
            "result": result_data,
            "error": error_data,
            "error_reason": task.error_reason,
        }
        await manager.broadcast_task_update(task.id, ws_status_payload)

        ws_compat_payload = {
            "event": "TASK_STATUS_UPDATE",
            "task_id": task.id,
            "status": task.status,
            "updated_at": task.updated_at.isoformat(),
            "new_log": final_log,
            "logs": task.logs,
            "result": result_data,
            "error": error_data,
            "error_reason": task.error_reason,
        }
        await manager.broadcast_task_update(task.id, ws_compat_payload)

    except Exception as e:
        logger.exception(
            f"Exception during background processing of task {task_id}: {e}"
        )
        db.rollback()
    finally:
        db.close()
