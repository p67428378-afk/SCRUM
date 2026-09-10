def test_list_services(client):
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4  # Seeded services


def test_create_and_get_service(client):
    payload = {
        "name": "Hair Extension",
        "duration_minutes": 90,
        "price": 200.0,
        "loyalty_points_earned": 40,
    }
    create_res = client.post("/api/v1/services", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["name"] == "Hair Extension"
    assert created["duration_minutes"] == 90

    svc_id = created["id"]
    get_res = client.get(f"/api/v1/services/{svc_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == svc_id
