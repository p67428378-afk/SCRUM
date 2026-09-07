def test_get_forecasts_success(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/forecasts?location_id={loc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == loc_id
    assert "daily" in data
    assert "hourly" in data
    assert len(data["daily"]) >= 1


def test_get_forecasts_invalid_location(client):
    response = client.get("/api/v1/forecasts?location_id=nonexistent-id")
    assert response.status_code == 404
