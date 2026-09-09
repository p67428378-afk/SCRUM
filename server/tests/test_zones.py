def test_list_zones(client):
    response = client.get("/api/v1/zones")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 2
    codes = [item["zone_code"] for item in data["items"]]
    assert "ZONE-01" in codes
    assert "ZONE-04" in codes


def test_create_zone(client):
    payload = {
        "zone_code": "ZONE-99",
        "name": "East Residential District",
        "description": "New residential zone development",
        "status": "ACTIVE",
    }
    response = client.post("/api/v1/zones", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["zone_code"] == "ZONE-99"
    assert data["name"] == "East Residential District"
    assert "id" in data


def test_create_duplicate_zone_code(client):
    payload = {
        "zone_code": "ZONE-01",
        "name": "Duplicate Zone",
    }
    response = client.post("/api/v1/zones", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_zone_by_id(client):
    list_resp = client.get("/api/v1/zones")
    zone_id = list_resp.json()["items"][0]["id"]

    response = client.get(f"/api/v1/zones/{zone_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == zone_id


def test_get_nonexistent_zone(client):
    response = client.get("/api/v1/zones/nonexistent-uuid")
    assert response.status_code == 404


def test_get_zone_utility_metrics(client):
    list_resp = client.get("/api/v1/zones")
    zone4 = next(z for z in list_resp.json()["items"] if z["zone_code"] == "ZONE-04")

    response = client.get(f"/api/v1/zones/{zone4['id']}/utility-metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert isinstance(metrics, list)
    assert len(metrics) >= 1
    metric_types = [m["metric_type"] for m in metrics]
    assert "WATER_CONSUMPTION" in metric_types


def test_create_zone_utility_metric(client):
    list_resp = client.get("/api/v1/zones")
    zone1_id = list_resp.json()["items"][0]["id"]

    payload = {"metric_type": "POWER_GRID_STABILITY", "value": 99.5, "unit": "PERCENT"}
    response = client.post(f"/api/v1/zones/{zone1_id}/utility-metrics", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["metric_type"] == "POWER_GRID_STABILITY"
    assert data["value"] == 99.5
    assert data["zone_id"] == zone1_id
