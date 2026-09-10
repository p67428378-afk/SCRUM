import uuid
from decimal import Decimal
import pytest
from server.models.account import Account


@pytest.fixture
def test_accounts(db_session):
    sender_id = uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    receiver_id = uuid.UUID("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22")

    sender = Account(
        id=sender_id,
        user_name="John Doe",
        balance=Decimal("15420.50"),
    )
    receiver = Account(
        id=receiver_id,
        user_name="Jane Smith",
        balance=Decimal("5000.00"),
    )
    db_session.add_all([sender, receiver])
    db_session.commit()
    db_session.refresh(sender)
    db_session.refresh(receiver)
    return {"sender": sender, "receiver": receiver}


def test_successful_transfer(client, test_accounts, db_session):
    # AC: FastAPI Transfer Endpoint: Expose a POST /api/v1/transfers endpoint accepting sender_id, receiver_id, and amount.
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 150.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "id" in data
    assert data["sender_id"] == str(sender.id)
    assert data["receiver_id"] == str(receiver.id)
    assert data["amount"] == 150.00
    assert data["status"] == "COMPLETED"
    assert "created_at" in data
    assert "updated_at" in data

    # Verify database balances updated atomically
    db_session.refresh(sender)
    db_session.refresh(receiver)
    assert sender.balance == Decimal("15270.50")
    assert receiver.balance == Decimal("5150.00")


def test_exact_fraud_threshold_transfer(client, test_accounts, db_session):
    # AC: Synchronous Fraud & Funds Check: $10,000.00 passes fraud check if funds are available.
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 10000.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    assert response.json()["amount"] == 10000.00
    assert response.json()["status"] == "COMPLETED"

    db_session.refresh(sender)
    db_session.refresh(receiver)
    assert sender.balance == Decimal("5420.50")
    assert receiver.balance == Decimal("15000.00")


def test_fraud_threshold_exceeded_blocks_transfer(client, test_accounts, db_session):
    # AC: Synchronous Fraud & Funds Check: Block and flag any transfer where the amount exceeds $10,000 ("Blocked: Fraud threshold exceeded")
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 10000.01,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked: Fraud threshold exceeded"

    # Verify balances were not deducted
    db_session.refresh(sender)
    db_session.refresh(receiver)
    assert sender.balance == Decimal("15420.50")
    assert receiver.balance == Decimal("5000.00")


def test_large_fraud_transfer_blocked(client, test_accounts, db_session):
    # AC: Synchronous Fraud & Funds Check: Transfers exceeding $10,000 are blocked
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 12500.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked: Fraud threshold exceeded"


def test_insufficient_funds_blocks_transfer(client, test_accounts, db_session):
    # AC: Synchronous Fraud & Funds Check: Block any transfer where sender has insufficient funds ("Insufficient funds")
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    # Set sender balance to 200.00
    sender.balance = Decimal("200.00")
    db_session.commit()

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 200.01,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient funds"

    # Verify balances unchanged
    db_session.refresh(sender)
    assert sender.balance == Decimal("200.00")


def test_exact_balance_transfer_succeeds(client, test_accounts, db_session):
    # AC: Synchronous Fraud & Funds Check: Transfer exactly equal to balance succeeds
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    sender.balance = Decimal("200.00")
    db_session.commit()

    payload = {
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id),
        "amount": 200.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201

    db_session.refresh(sender)
    db_session.refresh(receiver)
    assert sender.balance == Decimal("0.00")
    assert receiver.balance == Decimal("5200.00")


def test_invalid_transfer_amount_validation(client, test_accounts):
    # AC: FastAPI Transfer Endpoint: Amount must be > 0
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    # Test 0 amount
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": str(sender.id),
            "receiver_id": str(receiver.id),
            "amount": 0.0,
        },
    )
    assert response.status_code == 422

    # Test negative amount
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": str(sender.id),
            "receiver_id": str(receiver.id),
            "amount": -50.0,
        },
    )
    assert response.status_code == 422


def test_nonexistent_sender_or_receiver(client, test_accounts):
    # AC: Business rule check: Invalid accounts return 404
    non_existent = str(uuid.uuid4())
    valid_id = str(test_accounts["sender"].id)

    response = client.post(
        "/api/v1/transfers",
        json={"sender_id": non_existent, "receiver_id": valid_id, "amount": 50.0},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Sender account not found"

    response = client.post(
        "/api/v1/transfers",
        json={"sender_id": valid_id, "receiver_id": non_existent, "amount": 50.0},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Receiver account not found"


def test_transfer_to_same_account_blocked(client, test_accounts):
    # AC: Business rule check: Cannot transfer to self
    valid_id = str(test_accounts["sender"].id)
    response = client.post(
        "/api/v1/transfers",
        json={"sender_id": valid_id, "receiver_id": valid_id, "amount": 50.0},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot transfer to the same account"


def test_list_and_get_transfers(client, test_accounts):
    # AC: PostgreSQL Database Schema: Store and query transfer records
    sender = test_accounts["sender"]
    receiver = test_accounts["receiver"]

    res1 = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": str(sender.id),
            "receiver_id": str(receiver.id),
            "amount": 100.0,
        },
    )
    assert res1.status_code == 201
    transfer1_id = res1.json()["id"]

    res2 = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": str(sender.id),
            "receiver_id": str(receiver.id),
            "amount": 200.0,
        },
    )
    assert res2.status_code == 201

    # List transfers
    list_res = client.get("/api/v1/transfers")
    assert list_res.status_code == 200
    transfers = list_res.json()
    assert len(transfers) >= 2

    # Get single transfer
    get_res = client.get(f"/api/v1/transfers/{transfer1_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == transfer1_id
    assert get_res.json()["amount"] == 100.0


def test_accounts_api(client):
    # Test Account CRUD
    create_res = client.post(
        "/api/v1/accounts",
        json={"user_name": "Alice Wonderland", "balance": 1000.00},
    )
    assert create_res.status_code == 201
    account_id = create_res.json()["id"]
    assert create_res.json()["user_name"] == "Alice Wonderland"
    assert create_res.json()["balance"] == 1000.00

    # Get account
    get_res = client.get(f"/api/v1/accounts/{account_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == account_id

    # List accounts
    list_res = client.get("/api/v1/accounts")
    assert list_res.status_code == 200
    assert any(acc["id"] == account_id for acc in list_res.json())
