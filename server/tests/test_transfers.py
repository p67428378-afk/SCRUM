import uuid
from decimal import Decimal
import pytest


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "transfers_endpoint" in response.json()


def test_successful_transfer(client):
    # Sender with sufficient funds (seeded with $12,500.00)
    sender_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": 250.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["sender_id"] == sender_id
    assert data["receiver_id"] == receiver_id
    assert float(data["amount"]) == 250.00
    assert data["status"] == "COMPLETED"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_fraud_threshold_exceeded(client):
    # Transfer exceeding $10,000 threshold
    sender_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": 10001.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked: Fraud threshold exceeded"


def test_fraud_threshold_boundary_10000(client):
    # Exactly $10,000 should be permitted if sender has sufficient balance
    sender_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": 10000.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    # Sender had 12,500 - 250 = 12,250 left; 10,000 <= 12,250 -> 201 Created
    assert response.status_code == 201
    assert float(response.json()["amount"]) == 10000.00


def test_insufficient_funds(client):
    # Sender account seeded with $120.00 balance
    low_balance_sender = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
    payload = {
        "sender_id": low_balance_sender,
        "receiver_id": receiver_id,
        "amount": 500.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient funds"


def test_invalid_negative_or_zero_amount(client):
    sender_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"

    # Zero amount
    resp_zero = client.post("/api/v1/transfers", json={
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": 0,
    })
    assert resp_zero.status_code == 422

    # Negative amount
    resp_neg = client.post("/api/v1/transfers", json={
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": -50.00,
    })
    assert resp_neg.status_code == 422


def test_invalid_uuid_format(client):
    resp = client.post("/api/v1/transfers", json={
        "sender_id": "invalid-uuid-format",
        "receiver_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        "amount": 100.00,
    })
    assert resp.status_code == 422


def test_list_and_get_transfers(client):
    # First get list
    list_resp = client.get("/api/v1/transfers")
    assert list_resp.status_code == 200
    transfers = list_resp.json()
    assert isinstance(transfers, list)
    assert len(transfers) >= 1

    first_transfer_id = transfers[0]["id"]
    get_resp = client.get(f"/api/v1/transfers/{first_transfer_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == first_transfer_id

    # Non-existent ID
    non_existent_id = str(uuid.uuid4())
    not_found_resp = client.get(f"/api/v1/transfers/{non_existent_id}")
    assert not_found_resp.status_code == 404


def test_list_and_get_accounts(client):
    list_resp = client.get("/api/v1/accounts")
    assert list_resp.status_code == 200
    accounts = list_resp.json()
    assert len(accounts) >= 3

    acc_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    get_resp = client.get(f"/api/v1/accounts/{acc_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == acc_id
