import uuid
from server.tests.test_banking import get_auth_headers


def test_webhook_subscriptions(client):
    headers = get_auth_headers(client)

    # Create subscription
    payload = {
        "url": "https://example.com/webhook",
        "event_type": "payee_added",
        "secret": "mysecret",
    }
    response = client.post("/api/v1/webhooks", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == "https://example.com/webhook"
    assert data["event_type"] == "payee_added"
    sub_id = data["id"]

    # List subscriptions
    list_response = client.get("/api/v1/webhooks", headers=headers)
    assert list_response.status_code == 200
    assert any(sub["id"] == sub_id for sub in list_response.json())

    # Delete subscription
    delete_response = client.delete(f"/api/v1/webhooks/{sub_id}", headers=headers)
    assert delete_response.status_code == 204


def test_delete_webhook_not_found(client):
    headers = get_auth_headers(client)
    response = client.delete(f"/api/v1/webhooks/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404
