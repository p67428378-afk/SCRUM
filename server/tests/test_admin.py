from fastapi import status


def get_admin_token(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "adminuser", "password": "adminpassword"},
    )
    user_id = login_resp.json()["user"]["id"]
    client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    return verify_resp.json()["access_token"]


def get_user_token(client):
    login_resp = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    user_id = login_resp.json()["user"]["id"]
    client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    return verify_resp.json()["access_token"]


def test_admin_get_user_success(client):
    # AC: Bank operational teams must have a secure administrative portal to support customers and manage the platform.
    admin_token = get_admin_token(client)
    user_token = get_user_token(client)

    # Get user profile to find user ID
    profile_resp = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {user_token}"}
    )
    user_id = profile_resp.json()["user_id"]

    # Admin gets user
    admin_resp = client.get(
        f"/api/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_resp.status_code == status.HTTP_200_OK
    data = admin_resp.json()
    assert data["username"] == "testuser"
    assert data["profile"]["full_name"] == "Sarah Jenkins"
    assert len(data["accounts"]) == 3


def test_admin_get_user_forbidden_for_customer(client):
    # AC: Bank operational teams must have a secure administrative portal to support customers and manage the platform.
    user_token = get_user_token(client)

    # Customer tries to access admin endpoint
    admin_resp = client.get(
        "/api/v1/admin/users/some-id", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert admin_resp.status_code == status.HTTP_403_FORBIDDEN


def test_admin_get_logs_success(client):
    # AC: All user and system activities must be logged to create a comprehensive audit trail for security and compliance purposes.
    admin_token = get_admin_token(client)

    # Admin gets logs
    logs_resp = client.get(
        "/api/v1/admin/logs", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert logs_resp.status_code == status.HTTP_200_OK
    data = logs_resp.json()
    assert data["total"] > 0
    assert len(data["logs"]) > 0


def test_admin_open_account_success(client):
    admin_token = get_admin_token(client)
    user_token = get_user_token(client)

    # Get user profile to find user ID
    profile_resp = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {user_token}"}
    )
    user_id = profile_resp.json()["user_id"]

    response = client.post(
        "/api/v1/admin/accounts",
        json={
            "user_id": user_id,
            "account_type": "Checking",
            "initial_deposit": 500.00,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["account_type"] == "Checking"
    assert float(data["balance"]) == 500.00


def test_admin_update_account_success(client):
    admin_token = get_admin_token(client)
    user_token = get_user_token(client)

    # Get user profile to find user ID
    profile_resp = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {user_token}"}
    )
    user_id = profile_resp.json()["user_id"]

    # Get user details to find account ID
    admin_resp = client.get(
        f"/api/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    account_id = admin_resp.json()["accounts"][0]["id"]

    response = client.put(
        f"/api/v1/admin/accounts/{account_id}",
        json={"account_type": "Savings", "status": "restricted"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["account_type"] == "Savings"
    assert data["status"] == "restricted"


def test_admin_lock_user_success(client):
    admin_token = get_admin_token(client)
    user_token = get_user_token(client)

    # Get user profile to find user ID
    profile_resp = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {user_token}"}
    )
    user_id = profile_resp.json()["user_id"]

    response = client.put(
        f"/api/v1/admin/users/{user_id}/lock",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert "locked/deactivated" in response.json()["detail"]


def test_admin_force_password_reset_success(client):
    admin_token = get_admin_token(client)
    user_token = get_user_token(client)

    # Get user profile to find user ID
    profile_resp = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {user_token}"}
    )
    user_id = profile_resp.json()["user_id"]

    response = client.post(
        f"/api/v1/admin/users/{user_id}/force-password-reset",
        json={"new_password": "NewPassword123!"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert "successfully reset" in response.json()["detail"]
