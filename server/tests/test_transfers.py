import uuid
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from server.models.account import Account


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_valid_transfer_success(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    # Create sender account with sufficient funds
    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-001",
        balance=Decimal("5000.00"),
        currency="USD",
        status="ACTIVE",
    )
    receiver_acc = Account(
        id=receiver_id,
        user_id=receiver_id,
        account_number="ACC-TEST-002",
        balance=Decimal("100.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.add(receiver_acc)
    db_session.commit()

    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 250.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["sender_id"] == str(sender_id)
    assert data["receiver_id"] == str(receiver_id)
    assert data["amount"] == 250.00
    assert data["status"] == "COMPLETED"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    # Verify balances updated in DB
    db_session.refresh(sender_acc)
    db_session.refresh(receiver_acc)
    assert sender_acc.balance == Decimal("4750.00")
    assert receiver_acc.balance == Decimal("350.00")


def test_fraud_threshold_exceeded_blocked(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-003",
        balance=Decimal("50000.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.commit()

    # Transfer > $10,000.00
    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 10001.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Blocked: Fraud threshold exceeded"

    # Verify balance was NOT debited
    db_session.refresh(sender_acc)
    assert sender_acc.balance == Decimal("50000.00")


def test_fraud_threshold_exact_limit_allowed(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-004",
        balance=Decimal("20000.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.commit()

    # Exact $10,000.00 transfer is allowed
    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 10000.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 10000.00
    assert data["status"] == "COMPLETED"


def test_insufficient_funds_rejected(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-005",
        balance=Decimal("200.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.commit()

    # Attempt $1,000 transfer with $200 balance
    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 1000.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Insufficient funds"

    # Verify balance untouched
    db_session.refresh(sender_acc)
    assert sender_acc.balance == Decimal("200.00")


def test_exact_balance_transfer_succeeds(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-006",
        balance=Decimal("200.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.commit()

    # Exactly $200.00 with $200.00 balance
    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 200.00,
    }

    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 200.00
    assert data["status"] == "COMPLETED"

    # Verify balance is zero
    db_session.refresh(sender_acc)
    assert sender_acc.balance == Decimal("0.00")


def test_invalid_uuid_format_422(client: TestClient):
    payload = {
        "sender_id": "invalid-uuid-string",
        "receiver_id": "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22",
        "amount": 250.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_negative_amount_422(client: TestClient):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": -50.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_zero_amount_422(client: TestClient):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 0.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_missing_fields_422(client: TestClient):
    payload = {
        "sender_id": str(uuid.uuid4()),
        "amount": 100.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 422


def test_list_and_get_transfers(client: TestClient, db_session: Session):
    sender_id = uuid.uuid4()
    receiver_id = uuid.uuid4()

    sender_acc = Account(
        id=sender_id,
        user_id=sender_id,
        account_number="ACC-TEST-007",
        balance=Decimal("5000.00"),
        currency="USD",
        status="ACTIVE",
    )
    db_session.add(sender_acc)
    db_session.commit()

    # Create transfer
    payload = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "amount": 300.00,
    }
    post_res = client.post("/api/v1/transfers", json=payload)
    assert post_res.status_code == 201
    transfer_id = post_res.json()["id"]

    # List transfers
    list_res = client.get("/api/v1/transfers")
    assert list_res.status_code == 200
    transfers = list_res.json()
    assert len(transfers) >= 1
    assert any(t["id"] == transfer_id for t in transfers)

    # Filter by sender_id
    filtered_res = client.get(f"/api/v1/transfers?sender_id={sender_id}")
    assert filtered_res.status_code == 200
    assert len(filtered_res.json()) == 1

    # Get single transfer by ID
    get_res = client.get(f"/api/v1/transfers/{transfer_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == transfer_id

    # Get non-existent transfer
    random_id = uuid.uuid4()
    not_found_res = client.get(f"/api/v1/transfers/{random_id}")
    assert not_found_res.status_code == 404
