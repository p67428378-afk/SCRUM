def test_create_task_invalid_project_returns_422(client, member_auth_headers):
    res = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": "00000000-0000-0000-0000-000000000000",
            "summary": "Task with missing project",
            "priority": "Medium",
            "status": "To Do",
        },
    )
    assert res.status_code == 422
    assert "Referenced project" in res.json()["detail"]


def test_task_crud_lifecycle(client, member_auth_headers, member_user):
    # 1. Create project first
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Task Test Project", "status": "In Progress"},
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 2. Create task
    task_res = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": proj_id,
            "summary": "Build Analytics Feature",
            "description": "Implement task reporting endpoint",
            "priority": "High",
            "status": "To Do",
            "assignee_id": member_user.id,
        },
    )
    assert task_res.status_code == 201
    task_data = task_res.json()
    assert task_data["summary"] == "Build Analytics Feature"
    assert task_data["priority"] == "High"
    task_id = task_data["id"]

    # 3. Get task
    get_res = client.get(f"/api/v1/tasks/{task_id}", headers=member_auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_id

    # 4. Filter tasks
    filter_res = client.get(
        f"/api/v1/tasks?project_id={proj_id}&status=To Do",
        headers=member_auth_headers,
    )
    assert filter_res.status_code == 200
    assert len(filter_res.json()) >= 1

    # 5. Update task
    update_res = client.put(
        f"/api/v1/tasks/{task_id}",
        headers=member_auth_headers,
        json={"status": "In Progress"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"

    # 6. Delete task
    del_res = client.delete(f"/api/v1/tasks/{task_id}", headers=member_auth_headers)
    assert del_res.status_code == 204

    # 7. Verify deletion
    verify_res = client.get(f"/api/v1/tasks/{task_id}", headers=member_auth_headers)
    assert verify_res.status_code == 404
