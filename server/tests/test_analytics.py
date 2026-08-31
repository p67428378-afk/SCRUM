def test_analytics_empty_project_no_division_by_zero(client, member_auth_headers):
    # Create empty project
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Empty Project"},
    )
    proj_id = proj_res.json()["id"]

    # Query task analytics
    res = client.get(
        f"/api/v1/analytics/tasks?project_id={proj_id}",
        headers=member_auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_tasks"] == 0
    assert data["completed_tasks"] == 0
    assert data["completion_rate"] == 0.0
    assert data["overdue_tasks"] == 0
    assert data["status_distribution"]["To Do"] == 0

    # Query productivity analytics
    prod_res = client.get(
        f"/api/v1/analytics/productivity?project_id={proj_id}",
        headers=member_auth_headers,
    )
    assert prod_res.status_code == 200
    prod_data = prod_res.json()
    assert prod_data["avg_cycle_time_days"] == 0.0
    assert prod_data["productivity_by_user"] == []


def test_analytics_with_tasks(client, member_auth_headers, member_user):
    # Create project
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Analytics Active Project"},
    )
    proj_id = proj_res.json()["id"]

    # Create 4 tasks: 2 Done, 1 In Progress, 1 To Do
    client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": proj_id,
            "summary": "Task 1",
            "status": "Done",
            "assignee_id": member_user.id,
        },
    )
    client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={
            "project_id": proj_id,
            "summary": "Task 2",
            "status": "Done",
            "assignee_id": member_user.id,
        },
    )
    client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Task 3", "status": "In Progress"},
    )
    client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Task 4", "status": "To Do"},
    )

    # Check task analytics
    res = client.get(
        f"/api/v1/analytics/tasks?project_id={proj_id}",
        headers=member_auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_tasks"] == 4
    assert data["completed_tasks"] == 2
    assert data["completion_rate"] == 50.0
    assert data["status_distribution"]["Done"] == 2
    assert data["status_distribution"]["In Progress"] == 1
    assert data["status_distribution"]["To Do"] == 1

    # Check productivity analytics
    prod_res = client.get(
        f"/api/v1/analytics/productivity?project_id={proj_id}",
        headers=member_auth_headers,
    )
    assert prod_res.status_code == 200
    prod_data = prod_res.json()
    assert len(prod_data["productivity_by_user"]) >= 1
    assert prod_data["productivity_by_user"][0]["tasks_completed"] == 2
