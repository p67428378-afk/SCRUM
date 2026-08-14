def test_dashboard_stats(client, auth_headers):
    client.post(
        "/api/v1/tasks",
        json={"title": "D Task 1", "status": "Completed"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/tasks",
        json={"title": "D Task 2", "status": "In Progress"},
        headers=auth_headers,
    )

    resp = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    assert "completion_rate" in data
    assert "completed" in data
    assert "in_progress" in data
    assert "overdue" in data
