def test_create_service_request(client):
    zones = client.get("/api/v1/zones").json()["items"]
    citizens = client.get("/api/v1/citizens").json()
    zone_id = zones[0]["id"]
    citizen_id = citizens[0]["id"]

    payload = {
        "citizen_id": citizen_id,
        "zone_id": zone_id,
        "title": "Pothole on 5th Avenue",
        "description": "Large pothole causing traffic slowdown near civic center.",
        "category": "ROAD_MAINTENANCE",
        "priority": "MEDIUM",
    }
    response = client.post("/api/v1/service-requests", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Pothole on 5th Avenue"
    assert data["category"] == "ROAD_MAINTENANCE"
    assert data["status"] == "SUBMITTED"
    assert data["assigned_department"] == "DEPT_OF_TRANSPORTATION"
    assert "ticket_number" in data
    assert data["ticket_number"].startswith("SR-")


def test_list_service_requests(client):
    response = client.get("/api/v1/service-requests")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_filter_service_requests(client):
    response = client.get(
        "/api/v1/service-requests?status=SUBMITTED&category=WATER_INFRASTRUCTURE"
    )
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "SUBMITTED"
        assert item["category"] == "WATER_INFRASTRUCTURE"


def test_update_service_request_status(client):
    requests = client.get("/api/v1/service-requests").json()["items"]
    req_id = requests[0]["id"]

    patch_payload = {
        "status": "IN_PROGRESS",
        "assigned_department": "PUBLIC_WORKS_DEPT_2",
        "notes": "Dispatching repair crew #4 to site.",
    }
    response = client.patch(
        f"/api/v1/service-requests/{req_id}/status", json=patch_payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "IN_PROGRESS"
    assert data["assigned_department"] == "PUBLIC_WORKS_DEPT_2"
    assert data["notes"] == "Dispatching repair crew #4 to site."


def test_get_service_request_by_id(client):
    requests = client.get("/api/v1/service-requests").json()["items"]
    req_id = requests[0]["id"]

    response = client.get(f"/api/v1/service-requests/{req_id}")
    assert response.status_code == 200
    assert response.json()["id"] == req_id


def test_get_nonexistent_service_request(client):
    response = client.get("/api/v1/service-requests/nonexistent-id")
    assert response.status_code == 404
