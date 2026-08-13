from datetime import date, timedelta


def test_check_in_and_check_out_workflow(client, staff_auth_headers):
    # 1. Setup room and reservation
    room_res = client.post(
        "/api/v1/rooms",
        json={
            "room_number": "301",
            "room_type": "Standard",
            "capacity": 2,
            "base_rate_per_night": 120.00,
        },
        headers=staff_auth_headers,
    )
    room_id = room_res.json()["id"]

    today = date.today()
    booking_res = client.post(
        "/api/v1/reservations",
        json={
            "room_id": room_id,
            "guest_full_name": "Alice Cooper",
            "guest_email": "alice@example.com",
            "check_in_date": str(today),
            "check_out_date": str(today + timedelta(days=2)),
            "number_of_guests": 2,
        },
        headers=staff_auth_headers,
    )
    res_id = booking_res.json()["id"]

    # 2. Check-In
    checkin_res = client.post(
        f"/api/v1/folios/{res_id}/check-in",
        json={"key_card_assigned": "KEY-301-A"},
        headers=staff_auth_headers,
    )
    assert checkin_res.status_code == 200
    folio = checkin_res.json()
    assert folio["room_charges"] == 240.00
    assert folio["tax_amount"] == 24.00
    assert folio["total_due"] == 264.00
    assert folio["payment_status"] == "Pending"
    assert folio["key_card_assigned"] == "KEY-301-A"

    # Verify room status is Occupied
    room_check = client.get(f"/api/v1/rooms/{room_id}", headers=staff_auth_headers)
    assert room_check.json()["status"] == "Occupied"

    # 3. Check-Out
    checkout_res = client.post(
        f"/api/v1/folios/{res_id}/check-out",
        json={"payment_method": "Credit Card"},
        headers=staff_auth_headers,
    )
    assert checkout_res.status_code == 200
    updated_folio = checkout_res.json()
    assert updated_folio["payment_status"] == "Paid"
    assert updated_folio["payment_method"] == "Credit Card"

    # Verify room status is Cleaning
    room_check_after = client.get(
        f"/api/v1/rooms/{room_id}", headers=staff_auth_headers
    )
    assert room_check_after.json()["status"] == "Cleaning"

    # Verify reservation status is Checked-Out
    res_check = client.get(f"/api/v1/reservations/{res_id}", headers=staff_auth_headers)
    assert res_check.json()["status"] == "Checked-Out"
