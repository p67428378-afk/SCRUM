from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from server.models import Account


def test_create_transfer_success(client: TestClient, db: Session):
    """Test standard P2P money transfer with valid balances."""
    sender_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"  # Starts with $5,000.00
    receiver_id = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"  # Starts with $1,000.00
    amount = 500.00

    sender_acc_before = db.query(Account).filter(Account.user_id == sender_id).first()
    receiver_acc_before = (
        db.query(Account).filter(Account.user_id == receiver_id).first()
    )
    sender_balance_before = Decimal(str(sender_acc_before.balance))
    receiver_balance_before = Decimal(str(receiver_acc_before.balance))

    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "amount": amount,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["sender_id"] == sender_id
    assert data["receiver_id"] == receiver_id
    assert data["amount"] == 500.00
    assert data["status"] == "COMPLETED"
    assert "created_at" in data
    assert "updated_at" in data

    # Verify balances in database
    db.refresh(sender_acc_before)
    db.refresh(receiver_acc_before)
    assert Decimal(str(sender_acc_before.balance)) == sender_balance_before - Decimal(
        "500.00"
    )
    assert Decimal(
        str(receiver_acc_before.balance)
    ) == receiver_balance_before + Decimal("500.00")


def test_transfer_with_user_handle(client: TestClient):
    """Test transfer addressing recipient by their handle (usr_987654)."""
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "receiver_id": "usr_987654",
            "amount": 250.00,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["amount"] == 250.00


def test_transfer_zero_amount(client: TestClient):
    """Test transfer with zero amount is rejected with 400 Bad Request."""
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "receiver_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "amount": 0.00,
        },
    )
    assert response.status_code == 400
    assert "greater than zero" in response.json()["detail"].lower()


def test_transfer_negative_amount(client: TestClient):
    """Test transfer with negative amount is rejected with 400 Bad Request."""
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "receiver_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "amount": -50.00,
        },
    )
    assert response.status_code == 400
    assert "greater than zero" in response.json()["detail"].lower()


def test_transfer_self_account(client: TestClient):
    """Test transfer to own account is rejected with 400 Bad Request."""
    user_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    response = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": user_id,
            "receiver_id": user_id,
            "amount": 100.00,
        },
    )
    assert response.status_code == 400
    assert "same account" in response.json()["detail"].lower()


def test_list_transfers_and_pagination(client: TestClient):
    """Test listing transfers with pagination parameters."""
    response = client.get("/api/v1/transfers?skip=0&limit=10")
    assert response.status_code == 200
    transfers = response.json()
    assert isinstance(transfers, list)


def test_get_transfer_by_id(client: TestClient):
    """Test retrieving a specific transfer record by its ID."""
    # Create a transfer first
    create_res = client.post(
        "/api/v1/transfers",
        json={
            "sender_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "receiver_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "amount": 75.00,
        },
    )
    assert create_res.status_code == 201
    transfer_id = create_res.json()["id"]

    # Fetch by ID
    get_res = client.get(f"/api/v1/transfers/{transfer_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == transfer_id
    assert get_res.json()["amount"] == 75.00


def test_get_transfer_not_found(client: TestClient):
    """Test retrieving non-existent transfer returns 404."""
    response = client.get("/api/v1/transfers/non-existent-uuid-12345")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
