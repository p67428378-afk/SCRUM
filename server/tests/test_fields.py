def test_list_fields(client, auth_headers):
    response = client.get("/api/v1/fields", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_create_field(client, auth_headers):
    response = client.post(
        "/api/v1/fields",
        json={
            "name": "South Corn Field",
            "acreage": 85.0,
            "location_gis": "42.3601,-71.0589",
            "soil_type": "Clay",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "South Corn Field"
    assert data["acreage"] == 85.0


def test_create_crop_cycle(client, auth_headers):
    fields_res = client.get("/api/v1/fields", headers=auth_headers)
    field_id = fields_res.json()[0]["id"]

    response = client.post(
        "/api/v1/crop-cycles",
        json={
            "field_id": field_id,
            "crop_type": "Soybeans",
            "planting_date": "2026-05-01",
            "target_harvest_date": "2026-10-15",
            "soil_health_notes": "Good moisture",
            "status": "PLANTED",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["crop_type"] == "Soybeans"


def test_overlapping_crop_cycle_warning(client, auth_headers):
    fields_res = client.get("/api/v1/fields", headers=auth_headers)
    field_id = fields_res.json()[0]["id"]

    # First cycle
    client.post(
        "/api/v1/crop-cycles",
        json={
            "field_id": field_id,
            "crop_type": "Wheat",
            "planting_date": "2026-03-01",
            "status": "ACTIVE",
        },
        headers=auth_headers,
    )

    # Overlapping cycle
    response = client.post(
        "/api/v1/crop-cycles",
        json={
            "field_id": field_id,
            "crop_type": "Barley",
            "planting_date": "2026-03-15",
            "status": "ACTIVE",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert "[WARNING: Overlapping crop cycle" in data["soil_health_notes"]
