def test_ingest_weather_record_success(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    payload = {
        "location_id": loc_id,
        "temperature_celsius": 25.4,
        "humidity_percent": 55.0,
        "wind_speed_mph": 12.0,
        "wind_direction": "NE",
        "precipitation_inches": 0.0,
        "pressure_hpa": 1012.5,
        "uv_index": 5.0,
    }
    response = client.post("/api/v1/weather", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["location_id"] == loc_id
    assert data["temperature_celsius"] == 25.4


def test_ingest_weather_record_invalid_location(client):
    payload = {
        "location_id": "nonexistent-loc-id",
        "temperature_celsius": 20.0,
        "humidity_percent": 50.0,
        "wind_speed_mph": 10.0,
        "pressure_hpa": 1013.0,
    }
    response = client.post("/api/v1/weather", json=payload)
    assert response.status_code == 404


def test_get_current_weather(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/weather/current?location_id={loc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == loc_id
    assert "temperature_celsius" in data


def test_get_weather_history(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/weather/history?location_id={loc_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
