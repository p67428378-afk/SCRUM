from fastapi import status
from datetime import datetime, timezone, timedelta


def test_submit_adjustment_request(client):
    # AC: Employee can submit a manual adjustment request
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp_req@example.com",
            "password": "password",
            "full_name": "Employee Req",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "emp_req@example.com", "password": "password"},
    )
    token = login_resp.json()["access_token"]

    now = datetime.now(timezone.utc)
    check_in = now - timedelta(hours=8)
    check_out = now

    response = client.post(
        "/api/v1/approvals/request",
        json={
            "requested_check_in": check_in.isoformat(),
            "requested_check_out": check_out.isoformat(),
            "reason": "Forgot to check in/out",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["status"] == "Pending"
    assert data["reason"] == "Forgot to check in/out"


def test_manager_approve_request(client):
    # AC: Manager can approve manual attendance requests submitted by employees
    # 1. Register Manager
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "mgr1@example.com",
            "password": "password",
            "full_name": "Manager One",
            "role": "Manager",
        },
    )
    mgr_login = client.post(
        "/api/v1/auth/login", json={"email": "mgr1@example.com", "password": "password"}
    )
    mgr_token = mgr_login.json()["access_token"]
    mgr_id = mgr_login.json()["user"]["id"]

    # 2. Register Employee under Manager
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp_under_mgr@example.com",
            "password": "password",
            "full_name": "Employee Under Manager",
            "role": "Employee",
            "manager_id": mgr_id,
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "emp_under_mgr@example.com", "password": "password"},
    )
    emp_token = emp_login.json()["access_token"]

    # 3. Employee submits request
    now = datetime.now(timezone.utc)
    check_in = now - timedelta(hours=8)
    check_out = now

    req_resp = client.post(
        "/api/v1/approvals/request",
        json={
            "requested_check_in": check_in.isoformat(),
            "requested_check_out": check_out.isoformat(),
            "reason": "System downtime",
        },
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    request_id = req_resp.json()["id"]

    # 4. Manager lists requests
    list_resp = client.get(
        "/api/v1/approvals/requests", headers={"Authorization": f"Bearer {mgr_token}"}
    )
    assert list_resp.status_code == status.HTTP_200_OK
    assert len(list_resp.json()) == 1

    # 5. Manager approves request
    approve_resp = client.put(
        f"/api/v1/approvals/requests/{request_id}",
        json={"status": "Approved"},
        headers={"Authorization": f"Bearer {mgr_token}"},
    )
    assert approve_resp.status_code == status.HTTP_200_OK
    assert approve_resp.json()["status"] == "Approved"

    # 6. Verify attendance event was created
    history_resp = client.get(
        "/api/v1/attendance/history", headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert len(history_resp.json()) == 1
    assert history_resp.json()[0]["status"] in ["Present", "Late"]
