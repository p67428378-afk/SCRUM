from datetime import date, timedelta


def test_availability_and_booking_flow(client, staff_auth_headers):
    # 1. Create a room #201
    room_res = client.post(
        "/api/v1/rooms",
        json={
            "room_number": "201",
            "room_type": "Deluxe",
            "capacity": 2,
            "base_rate_per_night": 150.00,
        },
        headers=staff_auth_headers,
    )
    assert room_res.status_code == 201
    room_id = room_res.json()["id"]

    today = date.today()
    check_in = today + timedelta(days=10)
    check_out = today + timedelta(days=15)

    # 2. Search availability
    avail_res = client.get(
        f"/api/v1/reservations/availability?check_in_date={check_in}&check_out_date={check_out}&number_of_guests=2",
        headers=staff_auth_headers,
    )
    assert avail_res.status_code == 200
    avail_data = avail_res.json()
    room_ids = [r["id"] for r in avail_data["available_rooms"]]
    assert room_id in room_ids

    # 3. Create reservation
    booking_payload = {
        "room_id": room_id,
        "guest_full_name": "John Doe",
        "guest_email": "johndoe@example.com",
        "guest_phone": "123-456-7890",
        "check_in_date": str(check_in),
        "check_out_date": str(check_out),
        "number_of_guests": 2,
    }
    booking_res = client.post(
        "/api/v1/reservations", json=booking_payload, headers=staff_auth_headers
    )
    assert booking_res.status_code == 201
    res_data = booking_res.json()
    assert res_data["status"] == "Confirmed"
    assert res_data["total_amount"] == 750.00  # 5 nights * 150.00

    # 4. Attempt overlapping reservation for room 201 -> Expect 400 Bad Request
    overlap_check_in = today + timedelta(days=12)
    overlap_check_out = today + timedelta(days=14)
    overlap_payload = {
        "room_id": room_id,
        "guest_full_name": "Jane Smith",
        "guest_email": "janesmith@example.com",
        "check_in_date": str(overlap_check_in),
        "check_out_date": str(overlap_check_out),
        "number_of_guests": 1,
    }
    overlap_res = client.post(
        "/api/v1/reservations", json=overlap_payload, headers=staff_auth_headers
    )
    assert overlap_res.status_code == 400
    assert "already booked" in overlap_res.json()["detail"]


def test_cancel_reservation(client, staff_auth_headers):
    room_res = client.post(
        "/api/v1/rooms",
        json={
            "room_number": "202",
            "room_type": "Suite",
            "capacity": 4,
            "base_rate_per_night": 300.00,
        },
        headers=staff_auth_headers,
    )
    room_id = room_res.json()["id"]

    today = date.today()
    booking_res = client.post(
        "/api/v1/reservations",
        json={
            "room_id": room_id,
            "guest_full_name": "Bob Marley",
            "guest_email": "bob@example.com",
            "check_in_date": str(today + timedelta(days=1)),
            "check_out_date": str(today + timedelta(days=3)),
            "number_of_guests": 2,
        },
        headers=staff_auth_headers,
    )
    res_id = booking_res.json()["id"]

    # Cancel
    cancel_res = client.delete(
        f"/api/v1/reservations/{res_id}", headers=staff_auth_headers
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"
