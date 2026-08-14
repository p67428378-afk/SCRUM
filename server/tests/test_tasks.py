def test_create_and_get_task(client, auth_headers):
    task_data = {
        "title": "Build Backend",
        "description": "Implement task management API",
        "status": "In Progress",
        "priority": "High",
        "tags": ["backend", "fastapi"],
    }
    create_resp = client.post("/api/v1/tasks", json=task_data, headers=auth_headers)
    assert create_resp.status_code == 201
    created_task = create_resp.json()
    assert created_task["title"] == "Build Backend"
    assert created_task["priority"] == "High"
    task_id = created_task["id"]

    get_resp = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == task_id


def test_update_and_delete_task(client, auth_headers):
    create_resp = client.post(
        "/api/v1/tasks", json={"title": "Task to Update"}, headers=auth_headers
    )
    task_id = create_resp.json()["id"]

    update_resp = client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated Task Title", "status": "Completed"},
        headers=auth_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Task Title"
    assert update_resp.json()["status"] == "Completed"

    del_resp = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_task_search_filter_pagination(client, auth_headers):
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Task One",
            "status": "Pending",
            "priority": "Low",
            "tags": ["work"],
        },
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Task Two",
            "status": "Completed",
            "priority": "High",
            "tags": ["personal"],
        },
        headers=auth_headers,
    )

    resp = client.get("/api/v1/tasks?status=Pending", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all(item["status"] == "Pending" for item in items)

    resp_search = client.get("/api/v1/tasks?search=One", headers=auth_headers)
    assert resp_search.status_code == 200
    assert any("One" in item["title"] for item in resp_search.json()["items"])


def test_task_user_isolation(client, auth_headers):
    create_resp = client.post(
        "/api/v1/tasks", json={"title": "User 1 Secret Task"}, headers=auth_headers
    )
    task_id = create_resp.json()["id"]

    client.post(
        "/api/v1/auth/signup",
        json={"email": "user2@example.com", "password": "password123"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "user2@example.com", "password": "password123"},
    )
    user2_token = login_resp.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    get_resp = client.get(f"/api/v1/tasks/{task_id}", headers=user2_headers)
    assert get_resp.status_code == 404
