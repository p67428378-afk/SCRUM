def test_list_equipment(client, auth_headers):
    response = client.get("/api/v1/equipment", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_equipment(client, auth_headers):
    response = client.post(
        "/api/v1/equipment",
        json={
            "name": "Combine Harvester 5000",
            "serial_number": "CH-5000-01",
            "operating_hours": 100.0,
            "maintenance_threshold_hours": 300.0,
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Combine Harvester 5000"
    assert data["status"] == "OPERATIONAL"


def test_log_maintenance_threshold_trigger(client, auth_headers):
    # Create equipment near threshold
    eq_res = client.post(
        "/api/v1/equipment",
        json={
            "name": "Water Pump Tractor",
            "serial_number": "WP-T-88",
            "operating_hours": 290.0,
            "maintenance_threshold_hours": 300.0,
        },
        headers=auth_headers,
    )
    equip_id = eq_res.json()["id"]

    # Log 15 hours -> Total 305 >= 300
    response = client.post(
        f"/api/v1/equipment/{equip_id}/maintenance",
        json={
            "service_date": "2026-05-10",
            "operating_hours_logged": 15.0,
            "service_type": "INSPECTION",
            "description": "Logged field operating time",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201

    # Get equipment and verify status changed to MAINTENANCE_DUE
    get_res = client.get(f"/api/v1/equipment/{equip_id}", headers=auth_headers)
    assert get_res.json()["status"] == "MAINTENANCE_DUE"
