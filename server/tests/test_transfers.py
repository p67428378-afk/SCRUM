import pytest
from decimal import Decimal


def test_successful_transfer(client):
    # AC: Successful Money Transfer - Process POST /api/v1/transfers with sender_id, receiver_id, amount and record transaction
    payload = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 250.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sender_id"] == payload["sender_id"]
    assert data["receiver_id"] == payload["receiver_id"]
    assert float(data["amount"]) == 250.00
    assert data["status"] == "COMPLETED"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    # Verify updated sender balance (12450.00 - 250.00 = 12200.00)
    sender_resp = client.get(f"/api/v1/transfers/accounts/{payload['sender_id']}")
    assert sender_resp.status_code == 200
    assert float(sender_resp.json()["balance"]) == 12200.00

    # Verify updated receiver balance (1000.00 + 250.00 = 1250.00)
    receiver_resp = client.get(f"/api/v1/transfers/accounts/{payload['receiver_id']}")
    assert receiver_resp.status_code == 200
    assert float(receiver_resp.json()["balance"]) == 1250.00


def test_fraud_threshold_exceeded(client):
    # AC: Fraud Threshold Blocking ($10,000 Rule) - Synchronously block any transfer > $10,000.00 with 'Blocked: Fraud threshold exceeded'
    payload = {
        "sender_id": "22222222-2222-2222-2222-222222222222",  # Rich sender has $50k
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 10000.01,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Blocked: Fraud threshold exceeded"

    # Verify balance was NOT deducted
    sender_resp = client.get(f"/api/v1/transfers/accounts/{payload['sender_id']}")
    assert float(sender_resp.json()["balance"]) == 50000.00


def test_exact_fraud_threshold(client):
    # AC: Fraud Threshold Blocking ($10,000 Rule) - Exact $10,000.00 transfer is permitted
    payload = {
        "sender_id": "22222222-2222-2222-2222-222222222222",  # Rich sender has $50k
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 10000.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert float(data["amount"]) == 10000.00
    assert data["status"] == "COMPLETED"


def test_insufficient_funds(client):
    # AC: Insufficient Funds Validation - Verify sender balance >= transfer amount; return 'Insufficient funds'
    payload = {
        "sender_id": "11111111-1111-1111-1111-111111111111",  # Poor sender has $100
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 150.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Insufficient funds"

    # Verify sender balance remains unchanged
    sender_resp = client.get(f"/api/v1/transfers/accounts/{payload['sender_id']}")
    assert float(sender_resp.json()["balance"]) == 100.00


def test_exact_balance_transfer(client):
    # AC: Insufficient Funds Validation Edge Case - Transfer equals exact balance, leaves 0 balance
    payload = {
        "sender_id": "11111111-1111-1111-1111-111111111111",  # Poor sender has $100
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 100.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "COMPLETED"

    # Verify sender balance is now 0.00
    sender_resp = client.get(f"/api/v1/transfers/accounts/{payload['sender_id']}")
    assert float(sender_resp.json()["balance"]) == 0.00


def test_negative_or_zero_amount(client):
    # AC: Successful Money Transfer Edge Cases - Negative or zero amounts rejected with 422
    payload_zero = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 0.00,
    }
    resp_zero = client.post("/api/v1/transfers", json=payload_zero)
    assert resp_zero.status_code == 422

    payload_neg = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": -50.00,
    }
    resp_neg = client.post("/api/v1/transfers", json=payload_neg)
    assert resp_neg.status_code == 422


def test_sender_not_found(client):
    payload = {
        "sender_id": "99999999-9999-9999-9999-999999999999",
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 50.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Sender account not found"


def test_receiver_not_found(client):
    payload = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "99999999-9999-9999-9999-999999999999",
        "amount": 50.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Receiver account not found"


def test_same_sender_receiver(client):
    payload = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "550e8400-e29b-41d4-a716-446655440000",
        "amount": 50.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Sender and receiver accounts cannot be identical"


def test_list_transfers_and_accounts(client):
    # Test list accounts
    acc_resp = client.get("/api/v1/transfers/accounts")
    assert acc_resp.status_code == 200
    accounts = acc_resp.json()
    assert len(accounts) >= 2

    # Execute a transfer
    payload = {
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "amount": 100.00,
    }
    client.post("/api/v1/transfers", json=payload)

    # Test list transfers
    tr_resp = client.get("/api/v1/transfers")
    assert tr_resp.status_code == 200
    transfers = tr_resp.json()
    assert len(transfers) >= 1
    assert transfers[0]["status"] == "COMPLETED"


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
