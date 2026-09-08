def test_list_facilities(client, resident_headers):
    response = client.get("/api/v1/facilities", headers=resident_headers)
    assert response.status_code == 200
    facilities = response.json()
    assert isinstance(facilities, list)
    assert len(facilities) >= 1


def test_create_facility_admin(client, admin_headers):
    response = client.post(
        "/api/v1/facilities",
        headers=admin_headers,
        json={
            "name": "Basketball Court",
            "description": "Indoor basketball court",
            "capacity": 20,
            "hourly_rate": 30.0,
            "is_active": True,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Basketball Court"
    assert data["capacity"] == 20


def test_create_facility_resident_forbidden(client, resident_headers):
    response = client.post(
        "/api/v1/facilities",
        headers=resident_headers,
        json={"name": "Unauthorized Gym", "capacity": 10},
    )
    assert response.status_code == 403


def test_get_facility_by_id(client, resident_headers):
    list_res = client.get("/api/v1/facilities", headers=resident_headers)
    fac_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/facilities/{fac_id}", headers=resident_headers)
    assert response.status_code == 200
    assert response.json()["id"] == fac_id
