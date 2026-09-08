def test_create_booking_success(client, resident_headers):
    # Get a facility ID
    fac_res = client.get("/api/v1/facilities", headers=resident_headers)
    fac_id = fac_res.json()[0]["id"]

    response = client.post(
        "/api/v1/bookings",
        headers=resident_headers,
        json={
            "facility_id": fac_id,
            "booking_date": "2026-07-15",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "purpose": "Community Meeting",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Confirmed"
    assert data["facility_id"] == fac_id


def test_create_booking_conflict(client, resident_headers):
    fac_res = client.get("/api/v1/facilities", headers=resident_headers)
    fac_id = fac_res.json()[0]["id"]

    # Attempt overlapping booking on 2026-07-15 between 11:00 and 13:00 (overlaps 10:00-12:00)
    response = client.post(
        "/api/v1/bookings",
        headers=resident_headers,
        json={
            "facility_id": fac_id,
            "booking_date": "2026-07-15",
            "start_time": "11:00:00",
            "end_time": "13:00:00",
            "purpose": "Conflicting Party",
        },
    )
    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Facility is already booked for the selected time slot"
    )


def test_list_bookings(client, resident_headers):
    response = client.get("/api/v1/bookings", headers=resident_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_cancel_booking(client, resident_headers):
    fac_res = client.get("/api/v1/facilities", headers=resident_headers)
    fac_id = fac_res.json()[0]["id"]

    create_res = client.post(
        "/api/v1/bookings",
        headers=resident_headers,
        json={
            "facility_id": fac_id,
            "booking_date": "2026-08-01",
            "start_time": "14:00:00",
            "end_time": "16:00:00",
            "purpose": "Game Match",
        },
    )
    booking_id = create_res.json()["id"]

    response = client.delete(f"/api/v1/bookings/{booking_id}", headers=resident_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Cancelled"
