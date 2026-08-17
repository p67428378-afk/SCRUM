from fastapi import status


def test_check_in_success(client):
    # AC: Employee can check in successfully
    # Register and login
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp1@example.com",
            "password": "password",
            "full_name": "Employee One",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp1@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    response = client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["status"] in ["Present", "Late"]
    assert data["check_out_time"] is None
    assert "id" in data


def test_duplicate_check_in(client):
    # AC: Duplicate check-in attempts on active sessions return 400 Bad Request
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp2@example.com",
            "password": "password",
            "full_name": "Employee Two",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp2@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    # First check-in
    client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {token}"}
    )

    # Second check-in (duplicate)
    response = client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Active check-in session already exists."


def test_check_out_success(client):
    # AC: Employee can check out successfully
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp3@example.com",
            "password": "password",
            "full_name": "Employee Three",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp3@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    # Check-in
    client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {token}"}
    )

    # Check-out
    response = client.post(
        "/api/v1/attendance/check-out", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["check_out_time"] is not None


def test_check_out_no_active_session(client):
    # AC: Check-out without active session returns 400
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp4@example.com",
            "password": "password",
            "full_name": "Employee Four",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp4@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    response = client.post(
        "/api/v1/attendance/check-out", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "No active check-in session found."


def test_get_history(client):
    # AC: Employee can view personal attendance history
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp5@example.com",
            "password": "password",
            "full_name": "Employee Five",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp5@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    # Check-in and check-out
    client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {token}"}
    )
    client.post(
        "/api/v1/attendance/check-out", headers={"Authorization": f"Bearer {token}"}
    )

    response = client.get(
        "/api/v1/attendance/history", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] in ["Present", "Late", "Half-Day"]


def test_get_team_history_unauthorized(client):
    # AC: Regular employees receive 403 Forbidden when accessing team history
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp6@example.com",
            "password": "password",
            "full_name": "Employee Six",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "emp6@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/attendance/team", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
