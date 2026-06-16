"""
Module: test_kyc
Purpose: Unit and integration tests for KYC onboarding endpoints.
Author: Backend Developer Agent
Created: 2026-06-16
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set testing environment variable
os.environ["TESTING"] = "true"

from server.app.main import app
from server.app.database import Base, get_db

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Creates a fresh database for each test function.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Overrides get_db dependency with the testing session.
    """
    def _get_test_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_kyc_onboarding_happy_path(client):
    # AC: Aadhaar, PAN, RBI, CIBIL validations pass -> status APPROVED
    payload = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "customer_id" in data
    assert data["status"] == "APPROVED"


def test_kyc_onboarding_missing_consent(client):
    # AC: CIBIL Fraud Registry Screening: explicit digital consent is required. Missing consent returns 400.
    payload = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": False,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 400
    assert "CIBIL consent is required" in response.json()["detail"]


def test_kyc_onboarding_aadhaar_failure(client):
    # AC: Aadhaar Detail Acceptance and Validation: Fails if Aadhaar validation fails -> status FLAGGED
    payload = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "999999999999",  # Starts with 9 triggers mock failure
        "pan_number": "ABCDE1234F"
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "FLAGGED"


def test_kyc_onboarding_pan_failure(client):
    # AC: PAN Detail Acceptance and Validation: Fails if PAN validation fails -> status FLAGGED
    payload = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ZBCDE1234F"  # Starts with Z triggers mock failure
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "FLAGGED"


def test_kyc_onboarding_rbi_flagged(client):
    # AC: RBI Sanctions Screening: Screen customer against RBI sanctions lists in real-time -> status FLAGGED
    payload = {
        "name": "Sanctioned Terrorist",
        "email": "terrorist@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "FLAGGED"


def test_kyc_onboarding_cibil_flagged(client):
    # AC: CIBIL Fraud Registry Screening: Screen customer against CIBIL fraud registry -> status FLAGGED
    payload = {
        "name": "Amit Patel",  # Triggers mock CIBIL failure
        "email": "amit.patel@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    response = client.post("/api/kyc/onboarding", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "FLAGGED"


def test_get_kyc_requests_list(client):
    # AC: Retrieves a list of KYC onboarding requests with pagination and filtering.
    # Create one approved and one flagged request
    payload_approved = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    client.post("/api/kyc/onboarding", json=payload_approved)

    payload_flagged = {
        "name": "Amit Patel",
        "email": "amit.patel@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    client.post("/api/kyc/onboarding", json=payload_flagged)

    # Get all requests
    response = client.get("/api/kyc/requests")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Filter by status
    response_approved = client.get("/api/kyc/requests?status_filter=APPROVED")
    assert response_approved.status_code == 200
    data_approved = response_approved.json()
    assert len(data_approved) == 1
    assert data_approved[0]["final_status"] == "APPROVED"


def test_get_kyc_request_detail(client):
    # AC: Full Audit Trail Maintenance: Maintain comprehensive and immutable audit trail of all actions.
    payload = {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "phone": "+919876543210",
        "cibil_consent": True,
        "aadhaar_number": "123456789012",
        "pan_number": "ABCDE1234F"
    }
    create_res = client.post("/api/kyc/onboarding", json=payload)
    request_id = create_res.json()["id"]

    # Get detail
    response = client.get(f"/api/kyc/requests/{request_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == request_id
    assert data["status"] == "APPROVED"
    assert data["customer"]["name"] == "Rajesh Kumar"
    assert data["verification"]["aadhaar_status"] == "VERIFIED"
    assert data["screening"]["rbi_status"] == "CLEARED"
    assert len(data["audit_logs"]) > 0
    assert any(log["action"] == "CUSTOMER_CREATED" for log in data["audit_logs"])
    assert any(log["action"] == "STATUS_ASSIGNED" for log in data["audit_logs"])


def test_get_kyc_request_not_found(client):
    # AC: Retrieves detailed information about a specific KYC onboarding request, returns 404 if not found.
    response = client.get("/api/kyc/requests/non-existent-id")
    assert response.status_code == 404
