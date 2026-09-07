def test_create_alert_config(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    payload = {
        "location_id": loc_id,
        "metric_type": "WIND_SPEED",
        "operator": "GREATER_THAN",
        "threshold_value": 45.0,
        "user_email": "testalert@weather.org",
    }
    response = client.post("/api/v1/alerts/configs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["location_id"] == loc_id
    assert data["threshold_value"] == 45.0


def test_create_alert_config_invalid_metric(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    payload = {
        "location_id": loc_id,
        "metric_type": "INVALID_METRIC",
        "operator": "GREATER_THAN",
        "threshold_value": 100.0,
        "user_email": "test@weather.org",
    }
    response = client.post("/api/v1/alerts/configs", json=payload)
    assert response.status_code == 400


def test_alert_trigger_and_throttling(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    # Create alert config for precipitation > 2.0
    cfg_payload = {
        "location_id": loc_id,
        "metric_type": "PRECIPITATION",
        "operator": "GREATER_THAN",
        "threshold_value": 2.0,
        "user_email": "rain@weather.org",
    }
    cfg_res = client.post("/api/v1/alerts/configs", json=cfg_payload)
    assert cfg_res.status_code == 201

    # Ingest reading breaching threshold (precipitation = 3.5)
    reading1 = {
        "location_id": loc_id,
        "temperature_celsius": 18.0,
        "humidity_percent": 90.0,
        "wind_speed_mph": 15.0,
        "precipitation_inches": 3.5,
        "pressure_hpa": 1005.0,
        "uv_index": 1.0,
    }
    ingest1 = client.post("/api/v1/weather", json=reading1)
    assert ingest1.status_code == 201

    # Check notification log created
    notif_res1 = client.get(f"/api/v1/alerts/notifications?location_id={loc_id}")
    assert notif_res1.status_code == 200
    logs1 = notif_res1.json()
    count_before = len(logs1)
    assert count_before >= 1

    # Immediate second reading breaching threshold within 60s
    reading2 = {
        "location_id": loc_id,
        "temperature_celsius": 18.2,
        "humidity_percent": 91.0,
        "wind_speed_mph": 16.0,
        "precipitation_inches": 3.8,
        "pressure_hpa": 1004.0,
        "uv_index": 1.0,
    }
    ingest2 = client.post("/api/v1/weather", json=reading2)
    assert ingest2.status_code == 201

    # Verify throttling blocked duplicate notification
    notif_res2 = client.get(f"/api/v1/alerts/notifications?location_id={loc_id}")
    logs2 = notif_res2.json()
    count_after = len(logs2)
    assert count_after == count_before  # No new notification added due to throttling
