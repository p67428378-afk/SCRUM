import os

os.environ["TESTING"] = "true"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.app.main import app
from server.app.database import Base, get_db
from server.app import models

# Setup test database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]


client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]


def test_register_alert_success():
    payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
    }
    response = client.post("/api/v1/alerts/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "otpReferenceId" in data
    assert data["status"] == "PENDING_VERIFICATION"


def test_register_alert_card_not_found():
    payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "9999999999999999",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
    }
    response = client.post("/api/v1/alerts/register", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Card not found in system"


def test_register_alert_mobile_mismatch():
    payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919999999999",
    }
    response = client.post("/api/v1/alerts/register", json=payload)
    assert response.status_code == 400
    assert "does not match" in response.json()["detail"]


def test_register_alert_invalid_card_format():
    payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
    }
    response = client.post("/api/v1/alerts/register", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_send_otp_success():
    payload = {
        "mobileNumber": "+919876543210",
        "transactionType": "SPEND_ALERT_REGISTRATION",
    }
    response = client.post("/api/v1/otp/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "otpReferenceId" in data
    assert data["status"] == "SENT"


def test_verify_otp_and_activate_alert():
    # 1. Register to get OTP
    reg_payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
    }
    reg_response = client.post("/api/v1/alerts/register", json=reg_payload)
    otp_ref_id = reg_response.json()["otpReferenceId"]

    # Retrieve the generated OTP from the test database directly to verify
    db = TestingSessionLocal()
    otp_tx = (
        db.query(models.OTPTransaction).filter_by(otp_reference_id=otp_ref_id).first()
    )
    otp_code = otp_tx.otp_code
    db.close()

    # 2. Verify OTP
    verify_payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
        "otpCode": otp_code,
        "otpReferenceId": otp_ref_id,
    }
    verify_response = client.post("/api/v1/otp/verify", json=verify_payload)
    assert verify_response.status_code == 200
    verify_data = verify_response.json()
    assert verify_data["status"] == "ACTIVE"
    assert verify_data["cardIdentifier"] == "4321"
    assert verify_data["dailySpendThreshold"] == 5000.0

    # 3. Get active alerts
    get_response = client.get("/api/v1/alerts")
    assert get_response.status_code == 200
    alerts = get_response.json()
    assert len(alerts) == 1
    assert alerts[0]["card_identifier"] == "4321"
    assert alerts[0]["status"] == "ACTIVE"


def test_verify_otp_invalid_code():
    reg_payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
    }
    reg_response = client.post("/api/v1/alerts/register", json=reg_payload)
    otp_ref_id = reg_response.json()["otpReferenceId"]

    verify_payload = {
        "alertDeliveryChannel": "SMS",
        "cardNumber": "1234567812344321",
        "dailySpendThreshold": 5000.0,
        "mobileNumber": "+919876543210",
        "otpCode": "000000",  # Invalid code
        "otpReferenceId": otp_ref_id,
    }
    verify_response = client.post("/api/v1/otp/verify", json=verify_payload)
    assert verify_response.status_code == 400
    assert "Invalid or expired OTP" in verify_response.json()["detail"]


def test_daily_spend_exceeds_threshold_triggers_sms():
    # 1. Setup active alert rule
    db = TestingSessionLocal()
    alert_rule = models.AlertRule(
        card_identifier="4321",
        daily_spend_threshold=5000.0,
        alert_delivery_channel="SMS",
        status="ACTIVE",
        current_daily_spend=0.0,
    )
    db.add(alert_rule)
    db.commit()
    db.close()

    # 2. Simulate spend within threshold
    spend_payload = {"cardNumber": "1234567812344321", "amount": 3000.0}
    spend_response = client.post("/api/v1/alerts/simulate-spend", json=spend_payload)
    assert spend_response.status_code == 200
    spend_data = spend_response.json()
    assert spend_data["status"] == "ACTIVE"
    assert spend_data["breached"] is False
    assert spend_data["sms_sent"] is False

    # 3. Simulate spend exceeding threshold
    spend_payload_2 = {
        "cardNumber": "1234567812344321",
        "amount": 2500.0,  # Cumulative spend becomes 5500.0 > 5000.0
    }
    spend_response_2 = client.post(
        "/api/v1/alerts/simulate-spend", json=spend_payload_2
    )
    assert spend_response_2.status_code == 200
    spend_data_2 = spend_response_2.json()
    assert spend_data_2["status"] == "BREACHED"
    assert spend_data_2["breached"] is True
    assert spend_data_2["sms_sent"] is True
    assert "ALERT: Cumulative daily spend" in spend_data_2["message"]
    assert (
        "exceeding your configured threshold of 5000.00 INR" in spend_data_2["message"]
    )
