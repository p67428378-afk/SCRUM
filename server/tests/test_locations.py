def test_list_locations(client):
    response = client.get("/api/v1/locations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [loc["name"] for loc in data]
    assert "San Francisco Station" in names


def test_create_location_success(client):
    payload = {
        "name": "Chicago Station",
        "city": "Chicago",
        "state": "IL",
        "country": "USA",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "elevation_meters": 181.0,
    }
    response = client.post("/api/v1/locations", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Chicago Station"
    assert data["latitude"] == 41.8781
    assert data["status"] == "ACTIVE"


def test_create_location_invalid_gps(client):
    payload = {
        "name": "Invalid Station",
        "latitude": 120.0,  # Invalid (>90)
        "longitude": -87.6298,
    }
    response = client.post("/api/v1/locations", json=payload)
    assert response.status_code == 400
    assert "Invalid GPS coordinates" in response.json()["detail"]


def test_create_location_duplicate_name(client):
    payload = {
        "name": "San Francisco Station",
        "latitude": 37.7749,
        "longitude": -122.4194,
    }
    response = client.post("/api/v1/locations", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_location_by_id(client):
    list_res = client.get("/api/v1/locations")
    loc_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/locations/{loc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == loc_id


def test_get_location_not_found(client):
    response = client.get("/api/v1/locations/nonexistent-uuid")
    assert response.status_code == 404
