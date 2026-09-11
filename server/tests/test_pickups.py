def test_create_pickup_request(client):
    payload = {
        "waste_type": "Hazardous Waste",
        "address": "123 Main St",
        "scheduled_date": "2026-06-01",
        "time_slot": "09:00 - 12:00",
        "special_notes": "Handle with care",
    }
    response = client.post("/api/v1/pickups", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["waste_type"] == "Hazardous Waste"
    assert "tracking_code" in data
    assert data["tracking_code"].startswith("TRK-")


def test_list_pickups(client):
    response = client.get("/api/v1/pickups")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
