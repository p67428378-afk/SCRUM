from server.tests.test_banking import get_auth_headers


def test_admin_endpoints_forbidden_for_regular_user(client):
    headers = get_auth_headers(client, username="testuser", password="testpassword")

    # Try to list audit logs
    response = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()

    # Try to list risk signals
    response = client.get("/api/v1/admin/risk-signals", headers=headers)
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()


def test_admin_endpoints_allowed_for_admin(client):
    headers = get_auth_headers(client, username="admin", password="adminpassword")

    # List audit logs
    response = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert response.status_code == 200
    assert "items" in response.json()
    assert "total" in response.json()

    # List risk signals
    response = client.get("/api/v1/admin/risk-signals", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["signal_type"] == "VELOCITY_ANOMALY"


def test_audit_logs_filtering(client):
    headers = get_auth_headers(client, username="admin", password="adminpassword")

    # Trigger some events to generate audit logs
    client.get("/api/v1/accounts", headers=headers)

    # Query audit logs with filter
    response = client.get(
        "/api/v1/admin/audit-logs?event_type=LOGIN_SUCCESS", headers=headers
    )
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) >= 1
    assert all(item["event_type"] == "LOGIN_SUCCESS" for item in items)
