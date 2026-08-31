def test_create_task(client, member_headers):
    # First create a project
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Task Parent Project"}
    )
    project_id = proj_res.json()["id"]

    # Create task
    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={
            "project_id": project_id,
            "summary": "Implement Task Service",
            "description": "Add CRUD task endpoints",
            "priority": "High",
            "status": "To Do",
        },
    )
    assert task_res.status_code == 201
    data = task_res.json()
    assert data["summary"] == "Implement Task Service"
    assert data["priority"] == "High"
    assert data["status"] == "To Do"
    assert data["project_id"] == project_id


def test_create_task_invalid_project(client, member_headers):
    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": "non-existent-proj-id", "summary": "Invalid Project Task"},
    )
    assert task_res.status_code == 400
    assert task_res.json()["detail"] == "Project not found"


def test_list_tasks_and_filter(client, member_headers):
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Filter Tasks Project"},
    )
    project_id = proj_res.json()["id"]

    client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": project_id, "summary": "Task 1", "status": "To Do"},
    )
    client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": project_id, "summary": "Task 2", "status": "In Progress"},
    )

    # Filter by project_id
    res = client.get(f"/api/v1/tasks?project_id={project_id}", headers=member_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 2

    # Filter by status
    res_status = client.get(
        f"/api/v1/tasks?project_id={project_id}&status=In Progress",
        headers=member_headers,
    )
    assert res_status.status_code == 200
    assert len(res_status.json()) == 1
    assert res_status.json()[0]["summary"] == "Task 2"


def test_get_task_by_id(client, member_headers):
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Task Test Project"}
    )
    project_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": project_id, "summary": "Get Task Test"},
    )
    task_id = task_res.json()["id"]

    get_res = client.get(f"/api/v1/tasks/{task_id}", headers=member_headers)
    assert get_res.status_code == 200
    assert get_res.json()["summary"] == "Get Task Test"


def test_get_nonexistent_task(client, member_headers):
    res = client.get("/api/v1/tasks/non-existent-task-id", headers=member_headers)
    assert res.status_code == 404


def test_update_task(client, member_headers):
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Task Update Project"}
    )
    project_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": project_id, "summary": "Initial Task"},
    )
    task_id = task_res.json()["id"]

    update_res = client.put(
        f"/api/v1/tasks/{task_id}",
        headers=member_headers,
        json={
            "summary": "Updated Task Title",
            "priority": "Urgent",
            "status": "In Progress",
        },
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["summary"] == "Updated Task Title"
    assert data["priority"] == "Urgent"
    assert data["status"] == "In Progress"


def test_delete_task(client, member_headers):
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Task Delete Project"}
    )
    project_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": project_id, "summary": "Task To Delete"},
    )
    task_id = task_res.json()["id"]

    del_res = client.delete(f"/api/v1/tasks/{task_id}", headers=member_headers)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/tasks/{task_id}", headers=member_headers)
    assert get_res.status_code == 404
