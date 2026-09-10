def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_v1_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_accounts(client):
    response = client.get("/api/v1/accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 3
    account_ids = [acc["id"] for acc in accounts]
    assert "123e4567-e89b-12d3-a456-426614174000" in account_ids
    assert "987f6543-e89b-12d3-a456-426614174000" in account_ids


def test_get_account_by_id(client):
    sender_id = "123e4567-e89b-12d3-a456-426614174000"
    response = client.get(f"/api/v1/accounts/{sender_id}")
    assert response.status_code == 200
    account = response.json()
    assert account["id"] == sender_id
    assert account["balance"] >= 50000.0


def test_get_account_not_found(client):
    response = client.get("/api/v1/accounts/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_successful_transfer(client):
    sender_id = "123e4567-e89b-12d3-a456-426614174000"
    receiver_id = "987f6543-e89b-12d3-a456-426614174000"
    amount = 250.0

    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": amount,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sender_id"] == sender_id
    assert data["receiver_id"] == receiver_id
    assert data["amount"] == amount
    assert data["status"] == "COMPLETED"
    assert "id" in data
    assert "created_at" in data

    # Verify transfers list contains the new transfer
    list_res = client.get("/api/v1/transfers")
    assert list_res.status_code == 200
    transfers = list_res.json()
    assert any(t["id"] == data["id"] for t in transfers)

    # Verify single transfer fetch
    single_res = client.get(f"/api/v1/transfers/{data['id']}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == data["id"]


def test_fraud_threshold_exceeded(client):
    sender_id = "123e4567-e89b-12d3-a456-426614174000"
    receiver_id = "987f6543-e89b-12d3-a456-426614174000"
    amount = 10501.00  # Exceeds $10,000 threshold

    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": amount,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Blocked: Fraud threshold exceeded"


def test_insufficient_funds(client):
    # Account 3 has only $100
    sender_id = "222e4567-e89b-12d3-a456-426614174000"
    receiver_id = "987f6543-e89b-12d3-a456-426614174000"
    amount = 500.00

    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": amount,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Insufficient funds"


def test_invalid_uuid_payload(client):
    payload = {
        "sender_id": "not-a-uuid",
        "receiver_id": "987f6543-e89b-12d3-a456-426614174000",
        "amount": 100.0,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_negative_amount_payload(client):
    payload = {
        "sender_id": "123e4567-e89b-12d3-a456-426614174000",
        "receiver_id": "987f6543-e89b-12d3-a456-426614174000",
        "amount": -50.0,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422
