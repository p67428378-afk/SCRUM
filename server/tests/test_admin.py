from fastapi import status
from datetime import datetime, timezone, timedelta


def test_admin_adjust_attendance(client):
    # AC: Admin can manually adjust attendance records and generate audit logs
    # 1. Register Admin
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin_user@example.com",
            "password": "password",
            "full_name": "Admin User",
            "role": "Admin",
        },
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin_user@example.com", "password": "password"},
    )
    admin_token = admin_login.json()["access_token"]

    # 2. Register Employee
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp_to_adjust@example.com",
            "password": "password",
            "full_name": "Employee To Adjust",
            "role": "Employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "emp_to_adjust@example.com", "password": "password"},
    )
    emp_token = emp_login.json()["access_token"]

    # 3. Employee checks in
    check_in_resp = client.post(
        "/api/v1/attendance/check-in", headers={"Authorization": f"Bearer {emp_token}"}
    )
    attendance_id = check_in_resp.json()["id"]

    # 4. Admin adjusts attendance
    now = datetime.now(timezone.utc)
    new_check_in = now - timedelta(hours=9)
    new_check_out = now - timedelta(hours=1)

    adjust_resp = client.put(
        f"/api/v1/admin/attendance/{attendance_id}",
        json={},
        params={
            "requested_check_in": new_check_in.isoformat(),
            "requested_check_out": new_check_out.isoformat(),
            "reason": "Correction by HR",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert adjust_resp.status_code == status.HTTP_200_OK
    assert adjust_resp.json()["status"] in ["Present", "Late"]

    # 5. Admin lists audit logs
    audit_resp = client.get(
        "/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert audit_resp.status_code == status.HTTP_200_OK
    assert len(audit_resp.json()) == 1
    assert audit_resp.json()[0]["reason"] == "Correction by HR"


def test_admin_adjust_unauthorized(client):
    # AC: Regular employee cannot access admin adjustment endpoint
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "emp_unauth@example.com",
            "password": "password",
            "full_name": "Employee Unauth",
            "role": "Employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "emp_unauth@example.com", "password": "password"},
    )
    emp_token = emp_login.json()["access_token"]

    response = client.put(
        "/api/v1/admin/attendance/some-id",
        json={},
        params={
            "requested_check_in": datetime.now(timezone.utc).isoformat(),
            "requested_check_out": datetime.now(timezone.utc).isoformat(),
            "reason": "Hack attempt",
        },
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
