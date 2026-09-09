def test_create_and_list_quality_logs(client):
    # Fetch a recipe ID
    res = client.get("/api/v1/recipes")
    recipe_id = res.json()[0]["id"]

    log_payload = {
        "recipe_id": recipe_id,
        "rating": 5,
        "feedback": "Excellent flavor profile and aroma!",
    }

    create_res = client.post("/api/v1/quality-logs", json=log_payload)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["recipe_id"] == recipe_id
    assert data["rating"] == 5

    # List logs
    list_res = client.get("/api/v1/quality-logs")
    assert list_res.status_code == 200
    logs = list_res.json()
    assert isinstance(logs, list)
    assert len(logs) >= 1
    assert any(l["id"] == data["id"] for l in logs)
