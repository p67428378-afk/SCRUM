def test_create_payment_intent_success(client):
    # AC: Multi-Currency Payment Processing & Gateway Integration (Backend & Integration): Multi-currency checkout via Stripe with idempotency keys.

    # 1. Get a valid concert and ticket tier
    response = client.get("/api/v1/concerts")
    concert_id = response.json()["items"][0]["id"]

    response = client.get(f"/api/v1/concerts/{concert_id}")
    tier_id = response.json()["ticket_tiers"][0]["id"]
    currency = response.json()["ticket_tiers"][0]["currency_code"]

    # 2. Reserve tickets
    reserve_payload = {
        "concert_id": concert_id,
        "tier_id": tier_id,
        "quantity": 1,
        "user_email": "test@example.com",
    }
    response = client.post("/api/v1/tickets/reserve", json=reserve_payload)
    assert response.status_code == 201
    booking_id = response.json()["booking_id"]

    # 3. Create payment intent
    intent_payload = {
        "booking_id": booking_id,
        "currency": currency,
        "idempotency_key": "idemp_key_123",
    }
    response = client.post("/api/v1/payments/create-intent", json=intent_payload)
    assert response.status_code == 201
    intent_data = response.json()
    assert "client_secret" in intent_data
    assert intent_data["currency"] == currency

    # 4. Test idempotency (same key should return same response)
    response2 = client.post("/api/v1/payments/create-intent", json=intent_payload)
    assert response2.status_code == 201
    assert response2.json()["payment_intent_id"] == intent_data["payment_intent_id"]


def test_create_payment_intent_invalid_currency(client):
    # AC: Multi-Currency Payment Processing & Gateway Integration (Backend & Integration): Multi-currency checkout via Stripe with idempotency keys.
    response = client.get("/api/v1/concerts")
    concert_id = response.json()["items"][0]["id"]

    response = client.get(f"/api/v1/concerts/{concert_id}")
    tier_id = response.json()["ticket_tiers"][0]["id"]

    reserve_payload = {
        "concert_id": concert_id,
        "tier_id": tier_id,
        "quantity": 1,
        "user_email": "test@example.com",
    }
    response = client.post("/api/v1/tickets/reserve", json=reserve_payload)
    booking_id = response.json()["booking_id"]

    # Create payment intent with wrong currency (e.g., "XYZ")
    intent_payload = {
        "booking_id": booking_id,
        "currency": "XYZ",
        "idempotency_key": "idemp_key_456",
    }
    response = client.post("/api/v1/payments/create-intent", json=intent_payload)
    assert response.status_code == 400
    assert "invalid currency" in response.json()["detail"].lower()
