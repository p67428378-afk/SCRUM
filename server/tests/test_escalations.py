from datetime import datetime, timedelta, timezone


def test_high_priority_escalation_trigger_on_task_create(
    client, member_auth_headers, admin_user
):
    # 1. Create project
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Escalation Test Project"},
    )
    proj_id = proj_res.json()["id"]

    # 2. Create High priority task
    task_res = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": proj_id,
            "summary": "Urgent Server Outage Investigation",
            "priority": "High",
            "status": "To Do",
        },
    )
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 3. Check escalation logs endpoint
    esc_res = client.get(
        f"/api/v1/escalations?task_id={task_id}",
        headers=member_auth_headers,
    )
    assert esc_res.status_code == 200
    logs = esc_res.json()
    assert len(logs) >= 1
    assert logs[0]["task_id"] == task_id
    assert logs[0]["priority"] == "High"
    assert "High-priority escalation" in logs[0]["reason"]
    # Admin was assigned
    assert logs[0]["notified_admin_id"] == admin_user.id


def test_overdue_escalation_trigger_on_task_update(
    client, member_auth_headers, admin_user
):
    # 1. Create project & normal task
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Overdue Project"},
    )
    proj_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": proj_id,
            "summary": "Normal Task",
            "priority": "Low",
            "status": "In Progress",
        },
    )
    task_id = task_res.json()["id"]

    # 2. Update task to past due date
    past_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    update_res = client.put(
        f"/api/v1/tasks/{task_id}",
        headers=member_auth_headers,
        json={"due_date": past_date},
    )
    assert update_res.status_code == 200

    # 3. Check escalation logs
    esc_res = client.get(
        f"/api/v1/escalations?task_id={task_id}",
        headers=member_auth_headers,
    )
    assert esc_res.status_code == 200
    logs = esc_res.json()
    assert len(logs) >= 1
    assert any("Due-date escalation" in item["reason"] for item in logs)
