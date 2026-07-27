from server.tests.test_banking import get_auth_headers


def test_list_alerts(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/alerts", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_and_update_alert_preferences(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/alerts/preferences", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "push_enabled" in data

    # Update preferences via POST
    update_payload = {
        "push_enabled": False,
        "sms_enabled": True,
        "email_enabled": False,
        "low_balance_threshold": 50.00,
        "large_transaction_threshold": 500.00,
    }
    update_response = client.post(
        "/api/v1/alerts/preferences", json=update_payload, headers=headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["push_enabled"] is False
