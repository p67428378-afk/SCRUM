"""
Module: test_bus_tracking
Purpose: Unit and integration tests for Bus Tracking API endpoints and business logic
"""

from fastapi.testclient import TestClient


def test_list_routes(client: TestClient):
    response = client.get("/api/v1/routes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    codes = [r["code"] for r in data]
    assert "R101" in codes


def test_search_routes(client: TestClient):
    response = client.get("/api/v1/routes?q=Downtown")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Route 101" in data[0]["name"]


def test_get_route_details(client: TestClient):
    # Get list of routes to find R101 ID
    routes_res = client.get("/api/v1/routes?q=R101")
    route_id = routes_res.json()[0]["id"]

    response = client.get(f"/api/v1/routes/{route_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == route_id
    assert "route_stops" in data
    assert "active_buses" in data


def test_create_and_delete_route(client: TestClient):
    # 1. Create a new route with 0 buses
    payload = {
        "name": "Route 202 - Express",
        "code": "R202",
        "description": "Express shuttle route",
        "is_active": True,
    }
    create_res = client.post("/api/v1/routes", json=payload)
    assert create_res.status_code == 201
    route_data = create_res.json()
    route_id = route_data["id"]

    # 2. Delete route with 0 buses should succeed
    del_res = client.delete(f"/api/v1/routes/{route_id}")
    assert del_res.status_code == 200
    assert "deleted" in del_res.json()["message"].lower()


def test_delete_route_with_active_buses_fails(client: TestClient):
    # 1. Create route
    r_res = client.post(
        "/api/v1/routes",
        json={"name": "Route 303", "code": "R303", "description": "Busy route"},
    )
    route_id = r_res.json()["id"]

    # 2. Assign a bus to this route
    b_res = client.post(
        "/api/v1/buses",
        json={
            "bus_number": "BUS-99",
            "route_id": route_id,
            "driver_name": "Test Driver",
        },
    )
    assert b_res.status_code == 201

    # 3. Attempting to delete route should fail with 400
    del_res = client.delete(f"/api/v1/routes/{route_id}")
    assert del_res.status_code == 400
    assert "active assigned buses" in del_res.json()["detail"].lower()


def test_stop_autocomplete_search(client: TestClient):
    response = client.get("/api/v1/stops/search?q=Central")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Central Station" in data[0]["name"]


def test_bus_telemetry_and_stale_status(client: TestClient):
    # 1. Get buses
    buses_res = client.get("/api/v1/buses")
    assert buses_res.status_code == 200
    buses = buses_res.json()
    bus_42 = next(b for b in buses if b["bus_number"] == "BUS-42")

    # 2. Send live telemetry update
    telemetry_payload = {
        "bus_id": bus_42["id"],
        "latitude": 40.7140,
        "longitude": -74.0030,
        "speed_mph": 25.0,
        "heading": 90.0,
    }
    tel_res = client.post("/api/v1/buses/telemetry", json=telemetry_payload)
    assert tel_res.status_code == 200
    updated_bus = tel_res.json()
    assert updated_bus["latitude"] == 40.7140
    assert updated_bus["status"] == "Active"
    assert updated_bus["is_stale"] is False


def test_get_stop_eta(client: TestClient):
    # Get stop ID for "Main St & 5th Ave"
    stops_res = client.get("/api/v1/stops/search?q=Main St")
    stop = stops_res.json()[0]

    eta_res = client.get(f"/api/v1/stops/{stop['id']}/eta")
    assert eta_res.status_code == 200
    data = eta_res.json()
    assert data["stop_name"] == stop["name"]
    assert "approaching_buses" in data
    assert len(data["approaching_buses"]) >= 1


def test_alerts_creation_and_trigger(client: TestClient):
    # 1. Find a bus and stop
    bus_res = client.get("/api/v1/buses")
    bus = bus_res.json()[0]
    stop_res = client.get("/api/v1/stops/search?q=Central")
    stop = stop_res.json()[0]

    # 2. Create alert
    alert_payload = {
        "user_email": "passenger@example.com",
        "bus_id": bus["id"],
        "stop_id": stop["id"],
        "threshold_miles": 2.0,
    }
    create_res = client.post("/api/v1/alerts", json=alert_payload)
    assert create_res.status_code == 201
    alert_id = create_res.json()["id"]

    # 3. Ingest telemetry close to stop (0.01 miles)
    tel_res = client.post(
        "/api/v1/buses/telemetry",
        json={
            "bus_id": bus["id"],
            "latitude": stop["latitude"] + 0.0001,
            "longitude": stop["longitude"] + 0.0001,
            "speed_mph": 15.0,
        },
    )
    assert tel_res.status_code == 200

    # 4. Check alert is triggered
    alerts_res = client.get("/api/v1/alerts?user_email=passenger@example.com")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    triggered_alert = next(a for a in alerts if a["id"] == alert_id)
    assert triggered_alert["is_triggered"] is True
    assert "Triggered" in triggered_alert["message"]


def test_websocket_bus_locations(client: TestClient):
    with client.websocket_connect("/api/v1/ws/bus-locations") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "initial_snapshot"
        assert "buses" in data
