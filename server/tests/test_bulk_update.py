def test_bulk_update_success(client, member_auth_headers):
    # 1. Create project
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Bulk Project"},
    )
    proj_id = proj_res.json()["id"]

    # 2. Create two tasks in 'To Do' status
    t1 = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Task 1", "status": "To Do"},
    ).json()
    t2 = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Task 2", "status": "To Do"},
    ).json()

    # 3. Call bulk-update to 'Done'
    bulk_res = client.patch(
        "/api/v1/tasks/bulk-update",
        headers=member_auth_headers,
        json={"task_ids": [t1["id"], t2["id"]], "status": "Done"},
    )
    assert bulk_res.status_code == 200
    data = bulk_res.json()
    assert data["updated_count"] == 2
    assert len(data["tasks"]) == 2
    assert all(t["status"] == "Done" for t in data["tasks"])

    # 4. Verify in DB
    get_t1 = client.get(f"/api/v1/tasks/{t1['id']}", headers=member_auth_headers).json()
    get_t2 = client.get(f"/api/v1/tasks/{t2['id']}", headers=member_auth_headers).json()
    assert get_t1["status"] == "Done"
    assert get_t2["status"] == "Done"


def test_bulk_update_empty_ids_returns_400(client, member_auth_headers):
    res = client.patch(
        "/api/v1/tasks/bulk-update",
        headers=member_auth_headers,
        json={"task_ids": [], "status": "Done"},
    )
    # FastAPI/Pydantic min_length=1 returns 422 or our custom check returns 400
    assert res.status_code in [400, 422]


def test_bulk_update_atomic_rollback_on_missing_id(client, member_auth_headers):
    # Create project and one valid task
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Atomic Rollback Project"},
    )
    proj_id = proj_res.json()["id"]

    t1 = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Atomic Task 1", "status": "To Do"},
    ).json()

    # Call bulk-update with one valid and one non-existent ID
    fake_id = "00000000-0000-0000-0000-000000000000"
    bulk_res = client.patch(
        "/api/v1/tasks/bulk-update",
        headers=member_auth_headers,
        json={"task_ids": [t1["id"], fake_id], "status": "Done"},
    )
    assert bulk_res.status_code == 404

    # Verify t1 is still 'To Do' (not updated due to rollback)
    get_t1 = client.get(f"/api/v1/tasks/{t1['id']}", headers=member_auth_headers).json()
    assert get_t1["status"] == "To Do"
