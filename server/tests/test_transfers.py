import pytest
from server.models.account import Account
from server.models.transfer import Transfer

SENDER_ID = "123e4567-e89b-12d3-a456-426614174000"
RECEIVER_ID = "987f6543-e89b-12d3-a456-426614174000"
LOW_BALANCE_ID = "222e4567-e89b-12d3-a456-426614174000"


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "p2p-transfers-api"}


def test_successful_transfer(client, db_session):
    # Check initial balances
    sender_before = db_session.query(Account).filter(Account.id == SENDER_ID).first()
    receiver_before = db_session.query(Account).filter(Account.id == RECEIVER_ID).first()
    s_bal = sender_before.balance
    r_bal = receiver_before.balance

    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 250.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["sender_id"] == SENDER_ID
    assert data["receiver_id"] == RECEIVER_ID
    assert data["amount"] == 250.00
    assert data["status"] == "COMPLETED"
    assert "id" in data
    assert "created_at" in data

    # Verify balance changes in database
    db_session.expire_all()
    sender_after = db_session.query(Account).filter(Account.id == SENDER_ID).first()
    receiver_after = db_session.query(Account).filter(Account.id == RECEIVER_ID).first()

    assert sender_after.balance == pytest.approx(s_bal - 250.00)
    assert receiver_after.balance == pytest.approx(r_bal + 250.00)

    # Verify transfer record in DB
    record = db_session.query(Transfer).filter(Transfer.id == data["id"]).first()
    assert record is not None
    assert record.amount == 250.00


def test_fraud_threshold_exceeded(client):
    # Amounts exceeding $10,000 must be blocked with "Blocked: Fraud threshold exceeded"
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 10501.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked: Fraud threshold exceeded"


def test_fraud_threshold_boundary(client):
    # Exactly $10,000.01 exceeds threshold
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 10000.01
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked: Fraud threshold exceeded"


def test_insufficient_funds(client):
    # Sender has 100.00 balance, attempting to transfer 500.00
    payload = {
        "sender_id": LOW_BALANCE_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 500.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient funds"


def test_invalid_uuid_format(client):
    payload = {
        "sender_id": "invalid-uuid-string",
        "receiver_id": RECEIVER_ID,
        "amount": 50.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_negative_or_zero_amount(client):
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": -50.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422

    payload_zero = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 0.00
    }

    response_zero = client.post("/api/v1/transfers", json=payload_zero)
    assert response_zero.status_code == 422


def test_same_sender_and_receiver(client):
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": SENDER_ID,
        "amount": 50.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert "same account" in response.json()["detail"].lower()


def test_nonexistent_sender(client):
    payload = {
        "sender_id": "00000000-0000-0000-0000-000000000000",
        "receiver_id": RECEIVER_ID,
        "amount": 50.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 404


def test_nonexistent_receiver(client):
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": "00000000-0000-0000-0000-000000000000",
        "amount": 50.00
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 404


def test_list_transfers(client):
    response = client.get("/api/v1/transfers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_transfer_by_id(client):
    # First create a transfer
    payload = {
        "sender_id": SENDER_ID,
        "receiver_id": RECEIVER_ID,
        "amount": 100.00
    }
    create_res = client.post("/api/v1/transfers", json=payload)
    assert create_res.status_code == 201
    transfer_id = create_res.json()["id"]

    # Fetch by ID
    get_res = client.get(f"/api/v1/transfers/{transfer_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == transfer_id
    assert get_res.json()["amount"] == 100.00


def test_get_accounts(client):
    response = client.get("/api/v1/accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 4

    # Fetch single account
    acc_res = client.get(f"/api/v1/accounts/{SENDER_ID}")
    assert acc_res.status_code == 200
    assert acc_res.json()["id"] == SENDER_ID
