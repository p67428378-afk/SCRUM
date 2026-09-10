def test_list_livestock(client, auth_headers):
    response = client.get("/api/v1/livestock", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_livestock(client, auth_headers):
    response = client.post(
        "/api/v1/livestock",
        json={
            "tag_number": "SHEEP-501",
            "species": "Sheep",
            "breed": "Merino",
            "birth_date": "2025-02-10",
            "status": "HEALTHY",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["tag_number"] == "SHEEP-501"


def test_add_health_record_success(client, auth_headers):
    ls_res = client.get("/api/v1/livestock", headers=auth_headers)
    animal_id = ls_res.json()[0]["id"]

    response = client.post(
        f"/api/v1/livestock/{animal_id}/health-records",
        json={
            "event_type": "VACCINATION",
            "event_date": "2026-05-01",
            "medication_name": "Dewormer Plus",
            "next_due_date": "2026-11-01",
            "notes": "Routine preventative treatment",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["medication_name"] == "Dewormer Plus"


def test_add_health_record_missing_mandatory_fields(client, auth_headers):
    ls_res = client.get("/api/v1/livestock", headers=auth_headers)
    animal_id = ls_res.json()[0]["id"]

    response = client.post(
        f"/api/v1/livestock/{animal_id}/health-records",
        json={
            "event_type": "INSPECTION",
            "event_date": "2026-05-01",
            "medication_name": "",
        },
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_add_feeding_log(client, auth_headers):
    ls_res = client.get("/api/v1/livestock", headers=auth_headers)
    animal_id = ls_res.json()[0]["id"]

    response = client.post(
        f"/api/v1/livestock/{animal_id}/feeding-logs",
        json={
            "feed_type": "Alfalfa Hay",
            "quantity": 15.5,
            "unit": "kg",
            "feeding_time": "2026-05-15 08:00",
            "notes": "Morning feeding log",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["feed_type"] == "Alfalfa Hay"
    assert data["quantity"] == 15.5
