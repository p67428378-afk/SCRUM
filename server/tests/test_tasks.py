from datetime import datetime, timedelta
from fastapi import status
from server.models import Task
from server.services.task_engine import append_log


def test_create_task_returns_202(client, auth_headers):
    response = client.post(
        "/api/v1/tasks",
        json={
            "action_type": "report_generation",
            "payload_name": "Q3 Financials",
            "priority": "high",
            "parameters": {
                "report_type": "quarterly_summary",
                "year": 2026,
                "processing_delay": 0,
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_202_ACCEPTED
    data = response.json()
    assert "task_id" in data
    assert data["status"] == "pending"
    assert data["action_type"] == "report_generation"
    assert "created_at" in data
    assert "status_url" in data
    assert response.headers.get("Location") == data["status_url"]
    assert "logs" in data
    assert len(data["logs"]) >= 1
    assert data["logs_count"] >= 1


def test_get_task_status_lifecycle(client, auth_headers):
    post_res = client.post(
        "/api/v1/tasks",
        json={
            "action_type": "report_generation",
            "parameters": {"processing_delay": 0},
        },
        headers=auth_headers,
    )
    assert post_res.status_code == status.HTTP_202_ACCEPTED
    task_id = post_res.json()["task_id"]

    status_res_completed = client.get(
        f"/api/v1/tasks/{task_id}/status", headers=auth_headers
    )
    assert status_res_completed.status_code == status.HTTP_200_OK
    completed_data = status_res_completed.json()
    assert completed_data["status"] == "success"
    assert completed_data["result"] is not None
    assert "download_url" in completed_data["result"]
    assert "logs" in completed_data
    assert len(completed_data["logs"]) >= 2


def test_task_failed_state_with_structured_error(client, auth_headers):
    post_res = client.post(
        "/api/v1/tasks",
        json={
            "action_type": "payment_processing",
            "parameters": {
                "processing_delay": 0,
                "should_fail": True,
                "error_code": "PAY_402",
                "error_reason": "Credit card declined due to insufficient funds (Error Code: PAY_402).",
            },
        },
        headers=auth_headers,
    )
    assert post_res.status_code == status.HTTP_202_ACCEPTED
    task_id = post_res.json()["task_id"]

    status_res = client.get(f"/api/v1/tasks/{task_id}/status", headers=auth_headers)
    assert status_res.status_code == status.HTTP_200_OK
    data = status_res.json()
    assert data["status"] == "failed"
    assert data["error"] is not None
    assert data["error"]["code"] == "PAY_402"
    assert "declined" in data["error"]["reason"]
    # Check that error log entry is present
    error_logs = [log for log in data["logs"] if log["level"] == "ERROR"]
    assert len(error_logs) >= 1
    assert "PAY_402" in error_logs[0]["message"]


def test_task_status_unauthorized_user_403(client, auth_headers, alt_auth_headers):
    post_res = client.post(
        "/api/v1/tasks",
        json={"action_type": "file_upload", "parameters": {"processing_delay": 0}},
        headers=auth_headers,
    )
    task_id = post_res.json()["task_id"]

    status_res = client.get(f"/api/v1/tasks/{task_id}/status", headers=alt_auth_headers)
    assert status_res.status_code == status.HTTP_403_FORBIDDEN


def test_task_status_not_found_404(client, auth_headers):
    non_existent_id = "00000000-0000-0000-0000-000000000999"
    response = client.get(
        f"/api/v1/tasks/{non_existent_id}/status", headers=auth_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_list_tasks_history(client, auth_headers):
    client.post(
        "/api/v1/tasks",
        json={"action_type": "task_1", "parameters": {"processing_delay": 0}},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks",
        json={"action_type": "task_2", "parameters": {"processing_delay": 0}},
        headers=auth_headers,
    )

    response = client.get("/api/v1/tasks", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    tasks_list = response.json()
    assert isinstance(tasks_list, list)
    assert len(tasks_list) >= 2

    history_res = client.get("/api/v1/tasks/history", headers=auth_headers)
    assert history_res.status_code == status.HTTP_200_OK
    history_data = history_res.json()
    assert "items" in history_data
    assert "total" in history_data
    assert history_data["total"] >= 2


def test_websocket_task_status_connection(client, auth_headers):
    post_res = client.post(
        "/api/v1/tasks",
        json={
            "action_type": "report_generation",
            "parameters": {"processing_delay": 0},
        },
        headers=auth_headers,
    )
    task_id = post_res.json()["task_id"]

    with client.websocket_connect(f"/api/v1/ws/tasks/{task_id}") as websocket:
        msg = websocket.receive_json()
        assert msg["event"] == "TASK_STATUS_UPDATE"
        assert msg["task_id"] == task_id
        assert msg["status"] in ["pending", "success", "failed"]
        assert "logs" in msg


def test_task_escalation_after_30_seconds(client, auth_headers, db_session, test_user):
    old_time = datetime.utcnow() - timedelta(seconds=35)
    task = Task(
        user_id=test_user.id,
        action_type="report_generation",
        status="pending",
        logs=[
            {"timestamp": "2026-08-12T10:00:00Z", "level": "INFO", "message": "Init"}
        ],
        logs_count=1,
        created_at=old_time,
        updated_at=old_time,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    response = client.get(f"/api/v1/tasks/{task.id}/status", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_escalated"] is True
    assert "taking longer than usual" in data["escalation_message"]
    assert data["elapsed_seconds"] >= 30.0


def test_log_appending_and_1000_cap(db_session, test_user):
    task = Task(
        user_id=test_user.id,
        action_type="bulk_log_test",
        status="pending",
        logs=[],
        logs_count=0,
    )
    db_session.add(task)
    db_session.commit()

    # Append 1,005 logs
    for i in range(1005):
        append_log(task, "INFO", f"Log line {i}")

    db_session.commit()
    db_session.refresh(task)

    assert len(task.logs) == 1000
    assert task.logs_count == 1000
    assert task.logs[-1]["message"] == "Log line 1004"
