import uuid
from fastapi import status


def test_root_endpoint(client):
    """Test API root endpoint returns greeting and version."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "message" in data
    assert data["version"] == "1.0.0"


def test_health_check(client):
    """Test health check endpoints."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}

    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == status.HTTP_200_OK
    assert response_v1.json() == {"status": "ok"}


def test_successful_transfer(client):
    """Test successful P2P money transfer with status 201 Created."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 250.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert "id" in data
    assert uuid.UUID(data["id"])  # Valid UUID check
    assert data["sender_id"] == "usr_12345"
    assert data["receiver_id"] == "usr_98765"
    assert data["amount"] == 250.00
    assert data["status"] == "COMPLETED"
    assert "created_at" in data
    assert "updated_at" in data


def test_boundary_transfer_ten_thousand(client):
    """Test transfer exactly at $10,000.00 is allowed and returns 201 Created."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 10000.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["amount"] == 10000.00
    assert data["status"] == "COMPLETED"


def test_fraud_threshold_exceeded_by_one_cent(client):
    """Test transfer exceeding $10,000.00 (e.g. $10,000.01) is blocked with HTTP 400."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 10000.01}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert data["detail"] == "Blocked: Fraud threshold exceeded"


def test_fraud_threshold_exceeded_large_amount(client):
    """Test transfer with large amount ($50,000.00) is blocked with HTTP 400."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 50000.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert data["detail"] == "Blocked: Fraud threshold exceeded"


def test_insufficient_funds(client):
    """Test transfer exceeding sender's balance is blocked with HTTP 400."""
    # test_sender_low_balance is seeded with $50.00
    payload = {
        "sender_id": "test_sender_low_balance",
        "receiver_id": "usr_98765",
        "amount": 100.00,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert data["detail"] == "Insufficient funds"


def test_invalid_negative_amount(client):
    """Test transfer with negative amount returns 422 Unprocessable Entity."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": -50.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_zero_amount(client):
    """Test transfer with zero amount returns 422 Unprocessable Entity."""
    payload = {"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 0.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_missing_fields(client):
    """Test transfer with missing sender_id returns 422 Unprocessable Entity."""
    payload = {"receiver_id": "usr_98765", "amount": 100.00}
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_transfers_list(client):
    """Test listing transfers with pagination and user filtering."""
    # Execute a transfer first
    client.post(
        "/api/v1/transfers",
        json={"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 75.00},
    )

    response = client.get("/api/v1/transfers?skip=0&limit=10")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_transfer_by_id(client):
    """Test fetching a specific transfer by UUID."""
    create_resp = client.post(
        "/api/v1/transfers",
        json={"sender_id": "usr_12345", "receiver_id": "usr_98765", "amount": 120.00},
    )
    assert create_resp.status_code == status.HTTP_201_CREATED
    transfer_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/v1/transfers/{transfer_id}")
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json()["id"] == transfer_id
    assert get_resp.json()["amount"] == 120.00


def test_get_transfer_not_found(client):
    """Test fetching a nonexistent transfer returns 404."""
    non_existent_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/transfers/{non_existent_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_balance_update_on_transfer(client):
    """Test sender and receiver balances update accurately upon transfer."""
    sender_id = "test_balance_sender"
    receiver_id = "test_balance_receiver"

    # Fetch initial balances (created with default 10000 and 0)
    client.post(
        "/api/v1/transfers",
        json={"sender_id": sender_id, "receiver_id": receiver_id, "amount": 500.00},
    )

    sender_resp = client.get(f"/api/v1/accounts/{sender_id}/balance")
    assert sender_resp.status_code == status.HTTP_200_OK
    assert sender_resp.json()["balance"] == 9500.00

    receiver_resp = client.get(f"/api/v1/accounts/{receiver_id}/balance")
    assert receiver_resp.status_code == status.HTTP_200_OK
    assert receiver_resp.json()["balance"] == 500.00
