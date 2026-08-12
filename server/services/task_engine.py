import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import WebSocket
from sqlalchemy.orm import Session

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


async def process_task(
    task_id: str, action_type: str, parameters: Optional[Dict[str, Any]] = None
):
    """
    Background worker function that executes a long-running action,
    updates task state in DB, and broadcasts WebSocket status updates.
    """
    params = parameters or {}
    delay = params.get("processing_delay", 0.05)
    should_fail = params.get("should_fail", False)
    custom_error_code = params.get("error_code")
    custom_error_reason = params.get("error_reason")

    if delay > 0:
        await asyncio.sleep(delay)

    db: Session = server.database.SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            logger.error(f"Task {task_id} not found in background worker")
            return

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

            error_data = {"code": task.error_code, "reason": task.error_reason}
            result_data = None
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

            error_data = None
            result_data = task.result

        db.commit()
        db.refresh(task)

        # Broadcast update to WS clients
        ws_payload = {
            "event": "TASK_STATUS_UPDATE",
            "task_id": task.id,
            "status": task.status,
            "updated_at": task.updated_at.isoformat(),
            "result": result_data,
            "error": error_data,
        }
        await manager.broadcast_task_update(task.id, ws_payload)

    except Exception as e:
        logger.exception(
            f"Exception during background processing of task {task_id}: {e}"
        )
        db.rollback()
    finally:
        db.close()
