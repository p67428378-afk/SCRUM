from fastapi import status


def get_auth_token(client):
    login_resp = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    user_id = login_resp.json()["user"]["id"]
    client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    return verify_resp.json()["access_token"]


def test_get_profile_success(client):
    # AC: Customers can configure and receive alerts for various account activities to stay informed.
    token = get_auth_token(client)
    response = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["full_name"] == "Sarah Jenkins"
    assert data["email"] == "test@example.com"
    assert data["alert_on_transfer"] is True


def test_update_profile_success(client):
    # AC: Customers can configure and receive alerts for various account activities to stay informed.
    token = get_auth_token(client)
    response = client.put(
        "/api/v1/profile",
        json={
            "full_name": "Sarah Jenkins Updated",
            "address": "789 Updated St, New York, NY 10003",
            "alert_on_transfer": False,
            "alert_threshold": 500.00,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["full_name"] == "Sarah Jenkins Updated"
    assert data["address"] == "789 Updated St, New York, NY 10003"
    assert data["alert_on_transfer"] is False
    assert float(data["alert_threshold"]) == 500.00
