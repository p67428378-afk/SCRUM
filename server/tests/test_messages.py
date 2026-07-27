import uuid
from server.tests.test_banking import get_auth_headers


def test_list_messages(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/messages", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_send_and_read_message(client):
    headers = get_auth_headers(client)
    payload = {
        "subject": "Test Subject",
        "body": "Test Body",
    }
    response = client.post("/api/v1/messages", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["subject"] == "Test Subject"
    assert data["body"] == "Test Body"
    assert data["is_read"] is False
    message_id = data["id"]

    # Get single message
    get_response = client.get(f"/api/v1/messages/{message_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["subject"] == "Test Subject"

    # Mark as read
    read_response = client.put(
        f"/api/v1/messages/{message_id}", json={"is_read": True}, headers=headers
    )
    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True


def test_get_message_not_found(client):
    headers = get_auth_headers(client)
    response = client.get(f"/api/v1/messages/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404
