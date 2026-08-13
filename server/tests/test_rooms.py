def test_create_room(client, admin_auth_headers):
    payload = {
        "room_number": "101",
        "room_type": "Standard",
        "capacity": 2,
        "base_rate_per_night": 100.00,
        "status": "Available",
    }
    response = client.post("/api/v1/rooms", json=payload, headers=admin_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["room_number"] == "101"
    assert data["base_rate_per_night"] == 100.00


def test_create_duplicate_room(client, admin_auth_headers):
    payload = {
        "room_number": "101",
        "room_type": "Standard",
        "capacity": 2,
        "base_rate_per_night": 100.00,
        "status": "Available",
    }
    response = client.post("/api/v1/rooms", json=payload, headers=admin_auth_headers)
    assert response.status_code == 400


def test_list_and_filter_rooms(client, staff_auth_headers):
    response = client.get(
        "/api/v1/rooms?room_type=Standard", headers=staff_auth_headers
    )
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) >= 1
    room_numbers = [r["room_number"] for r in rooms]
    assert "101" in room_numbers


def test_update_room_housekeeping_restriction(
    client, housekeeping_auth_headers, staff_auth_headers
):
    # First create room 102
    res = client.post(
        "/api/v1/rooms",
        json={
            "room_number": "102",
            "room_type": "Deluxe",
            "capacity": 3,
            "base_rate_per_night": 150.00,
        },
        headers=staff_auth_headers,
    )
    assert res.status_code == 201
    room_id = res.json()["id"]

    # Housekeeping trying to change price -> forbidden
    res_hk = client.put(
        f"/api/v1/rooms/{room_id}",
        json={"base_rate_per_night": 200.00},
        headers=housekeeping_auth_headers,
    )
    assert res_hk.status_code == 403

    # Housekeeping changing status -> allowed
    res_hk_status = client.put(
        f"/api/v1/rooms/{room_id}",
        json={"status": "Cleaning"},
        headers=housekeeping_auth_headers,
    )
    assert res_hk_status.status_code == 200
    assert res_hk_status.json()["status"] == "Cleaning"
