def test_reserve_and_book_tickets_success(client):
    # AC: Seat Selection & Ticket Tier Reservation (Full-Stack): Interactive venue layout/tier selection with 10-minute hold lock.
    # AC: Ticket Confirmation & Digital QR Pass Generation (Full-Stack): Digital ticket confirmation with QR code pass, downloadable PDF, and email receipt.

    # 1. Get a valid concert and ticket tier
    response = client.get("/api/v1/concerts")
    concert_id = response.json()["items"][0]["id"]

    response = client.get(f"/api/v1/concerts/{concert_id}")
    tier_id = response.json()["ticket_tiers"][0]["id"]

    # 2. Reserve tickets
    reserve_payload = {
        "concert_id": concert_id,
        "tier_id": tier_id,
        "quantity": 2,
        "user_email": "test@example.com",
    }
    response = client.post("/api/v1/tickets/reserve", json=reserve_payload)
    assert response.status_code == 201
    reserve_data = response.json()
    assert reserve_data["status"] == "RESERVED"
    assert reserve_data["quantity"] == 2
    booking_id = reserve_data["booking_id"]

    # 3. Book tickets
    book_payload = {"booking_id": booking_id, "payment_intent_id": "pi_test_12345"}
    response = client.post("/api/v1/tickets/book", json=book_payload)
    assert response.status_code == 200
    book_data = response.json()
    assert book_data["status"] == "CONFIRMED"
    assert book_data["user_email"] == "test@example.com"
    assert "qr_code_data" in book_data["digital_pass"]


def test_reserve_insufficient_availability(client):
    # AC: Seat Selection & Ticket Tier Reservation (Full-Stack): Interactive venue layout/tier selection with 10-minute hold lock.
    response = client.get("/api/v1/concerts")
    concert_id = response.json()["items"][0]["id"]

    response = client.get(f"/api/v1/concerts/{concert_id}")
    tier_id = response.json()["ticket_tiers"][0]["id"]

    # Reserve more than available capacity (e.g., 999999)
    reserve_payload = {
        "concert_id": concert_id,
        "tier_id": tier_id,
        "quantity": 999999,
        "user_email": "test@example.com",
    }
    response = client.post("/api/v1/tickets/reserve", json=reserve_payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient ticket availability"
