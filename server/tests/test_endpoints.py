import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.app.database import Base, get_db
from server.app.main import app

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def run_around_tests():
    # Clear database before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_register_alert_success():
    response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "otpReferenceId" in data
    assert data["status"] == "PENDING_VERIFICATION"


def test_register_alert_invalid_card():
    response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "12345",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    assert response.status_code == 400
    assert "Invalid card number format" in response.json()["detail"]


def test_otp_send_success():
    response = client.post(
        "/api/v1/otp/send",
        json={"mobileNumber": "+919876543210", "transactionType": "ALERT_REGISTRATION"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "otpReferenceId" in data
    assert data["status"] == "SENT"


def test_otp_verify_success():
    # First register to get an OTP reference ID
    reg_response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    otp_ref_id = reg_response.json()["otpReferenceId"]

    # Verify OTP
    verify_response = client.post(
        "/api/v1/otp/verify",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
            "otpCode": "123456",
            "otpReferenceId": otp_ref_id,
        },
    )
    assert verify_response.status_code == 200
    data = verify_response.json()
    assert data["cardIdentifier"] == "5678"
    assert data["status"] == "ACTIVE"
    assert data["alertDeliveryChannel"] == "SMS"


def test_otp_verify_invalid_code():
    reg_response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    otp_ref_id = reg_response.json()["otpReferenceId"]

    verify_response = client.post(
        "/api/v1/otp/verify",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
            "otpCode": "wrong_code",
            "otpReferenceId": otp_ref_id,
        },
    )
    assert verify_response.status_code == 400
    assert "Invalid OTP code" in verify_response.json()["detail"]


def test_list_alerts():
    # Register and verify an alert
    reg_response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    otp_ref_id = reg_response.json()["otpReferenceId"]

    client.post(
        "/api/v1/otp/verify",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
            "otpCode": "123456",
            "otpReferenceId": otp_ref_id,
        },
    )

    # List alerts
    list_response = client.get("/api/v1/alerts")
    assert list_response.status_code == 200
    data = list_response.json()
    assert len(data) == 1
    assert data[0]["card_identifier"] == "5678"
    assert data[0]["status"] == "ACTIVE"


def test_simulate_spend_and_breach():
    # Register and verify an alert
    reg_response = client.post(
        "/api/v1/alerts/register",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
        },
    )
    otp_ref_id = reg_response.json()["otpReferenceId"]

    client.post(
        "/api/v1/otp/verify",
        json={
            "cardNumber": "1234567812345678",
            "mobileNumber": "+919876543210",
            "dailySpendThreshold": 5000,
            "alertDeliveryChannel": "SMS",
            "otpCode": "123456",
            "otpReferenceId": otp_ref_id,
        },
    )

    # Simulate spend below threshold
    spend_response = client.post(
        "/api/v1/alerts/simulate-spend",
        json={"cardNumber": "1234567812345678", "amount": 3000},
    )
    assert spend_response.status_code == 200
    assert spend_response.json()["sms_sent"] is False

    # Simulate spend exceeding threshold
    spend_response = client.post(
        "/api/v1/alerts/simulate-spend",
        json={"cardNumber": "1234567812345678", "amount": 2500},
    )
    assert spend_response.status_code == 200
    assert spend_response.json()["sms_sent"] is True
    assert "Immediate SMS alert sent" in spend_response.json()["message"]
