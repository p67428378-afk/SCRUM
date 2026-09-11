def test_list_routes(client):
    response = client.get("/api/v1/routes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_task_status(client):
    routes_res = client.get("/api/v1/routes")
    routes = routes_res.json()
    assert len(routes) > 0
    task_id = routes[0]["tasks"][0]["id"]

    response = client.patch(
        f"/api/v1/routes/tasks/{task_id}",
        json={"task_status": "Completed", "collected_weight_kg": 275.5},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_status"] == "Completed"
    assert data["collected_weight_kg"] == 275.5
