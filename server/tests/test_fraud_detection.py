from fastapi.testclient import TestClient


def test_fraud_threshold_exceeded_10001(client: TestClient):
    """Test transfer exceeding $10,000 threshold ($10,001.00) is synchronously blocked."""
    # Admin account has $15,000 balance, but amount exceeds $10,000 fraud limit
    admin_sender_id = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"

    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": admin_sender_id,
            "receiver_id": receiver_id,
            "amount": 10001.00,
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Blocked: Fraud threshold exceeded"}


def test_fraud_threshold_exceeded_12500(client: TestClient):
    """Test transfer of $12,500 is synchronously blocked."""
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "receiver_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "amount": 12500.00,
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Blocked: Fraud threshold exceeded"}


def test_fraud_threshold_boundary_10000_allowed(client: TestClient):
    """Test transfer of exactly $10,000 is allowed when sender has sufficient funds."""
    # Admin account has $15,000 balance
    admin_sender_id = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"

    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": admin_sender_id,
            "receiver_id": receiver_id,
            "amount": 10000.00,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 10000.00
    assert data["status"] == "COMPLETED"


def test_insufficient_funds_blocked(client: TestClient):
    """Test transfer exceeding sender balance ($1000 requested when balance is $200)."""
    # Low balance user has $200.00 balance
    low_balance_sender_id = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"

    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": low_balance_sender_id,
            "receiver_id": receiver_id,
            "amount": 1000.00,
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Insufficient funds"}


def test_fraud_priority_over_insufficient_funds(client: TestClient):
    """Test that fraud threshold check occurs before balance check for amounts > $10k."""
    # Low balance user ($200) requests $15,000 -> Should return Fraud threshold exceeded, not Insufficient funds
    low_balance_sender_id = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"

    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": low_balance_sender_id,
            "receiver_id": receiver_id,
            "amount": 15000.00,
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Blocked: Fraud threshold exceeded"}
