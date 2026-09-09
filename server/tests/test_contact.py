from fastapi.testclient import TestClient


def test_submit_contact_inquiry_valid(client: TestClient):
    payload = {
        "sender_name": "Marcus Vance",
        "sender_email": "marcus@castingagency.com",
        "project_type": "Film",
        "budget": "$50k-$100k",
        "project_dates": "Q4 2026",
        "message": "We would like to invite you to audition for a lead role in an upcoming feature film.",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "inquiry_id" in data
    assert "submitted_at" in data


def test_submit_contact_inquiry_invalid_email(client: TestClient):
    payload = {
        "sender_name": "Marcus Vance",
        "sender_email": "not-an-email",
        "project_type": "Film",
        "message": "Hello",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 422


def test_submit_contact_inquiry_missing_fields(client: TestClient):
    payload = {"sender_name": "Marcus Vance"}
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 422
