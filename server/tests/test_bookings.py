def test_list_poojas(client):
    response = client.get("/api/v1/poojas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    titles = [p["title"] for p in data]
    assert "Rudrabhishekam" in titles
    assert "Mahadev Aarti" in titles


def test_list_slots_and_create_booking(client, devotee_auth_headers):
    # 1. Fetch active poojas
    p_response = client.get("/api/v1/poojas")
    assert p_response.status_code == 200
    pooja_id = p_response.json()[0]["id"]

    # 2. Fetch slots for the pooja
    s_response = client.get(f"/api/v1/poojas/{pooja_id}/slots")
    assert s_response.status_code == 200
    slots = s_response.json()
    assert len(slots) > 0
    slot_id = slots[0]["id"]

    # 3. Create booking
    b_payload = {
        "slot_id": slot_id,
        "devotee_name": "Suresh Sharma",
        "devotee_phone": "9876543210",
        "gotra": "Kashyapa",
        "nakshatra": "Rohini",
        "booking_type": "Online",
    }
    b_response = client.post(
        "/api/v1/bookings", json=b_payload, headers=devotee_auth_headers
    )
    assert b_response.status_code == 201
    booking = b_response.json()
    assert booking["devotee_name"] == "Suresh Sharma"
    assert booking["gotra"] == "Kashyapa"
    assert booking["booking_reference"].startswith("SHIV-BKG-")

    # 4. Fetch my bookings
    my_b_response = client.get(
        "/api/v1/bookings/my-bookings", headers=devotee_auth_headers
    )
    assert my_b_response.status_code == 200
    my_bookings = my_b_response.json()
    assert any(b["id"] == booking["id"] for b in my_bookings)


def test_cancel_booking(client, devotee_auth_headers):
    # Retrieve existing booking to cancel
    my_b_response = client.get(
        "/api/v1/bookings/my-bookings", headers=devotee_auth_headers
    )
    assert my_b_response.status_code == 200
    my_bookings = my_b_response.json()
    assert len(my_bookings) > 0
    booking_id = my_bookings[0]["id"]

    # Cancel booking
    cancel_response = client.post(
        f"/api/v1/bookings/{booking_id}/cancel", headers=devotee_auth_headers
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "Cancelled"
