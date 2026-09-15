def get_tenant_id(client):
    res = client.get("/api/v1/tenants")
    tenants = res.json()
    if not tenants:
        onboard_res = client.post(
            "/api/v1/tenants",
            json={
                "name": "User Test Tenant",
                "slug": "user-test-tenant",
                "domain": "usertest.com",
                "admin_email": "admin@usertest.com",
            },
        )
        return onboard_res.json()["id"]
    return tenants[0]["id"]


def test_list_tenant_users(client):
    tenant_id = get_tenant_id(client)
    response = client.get(f"/api/v1/tenants/{tenant_id}/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_invite_user_to_tenant(client):
    tenant_id = get_tenant_id(client)
    payload = {
        "email": "invited_user@example.com",
        "full_name": "Invited User",
        "role": "User",
    }
    response = client.post(f"/api/v1/tenants/{tenant_id}/users", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "User"


def test_invite_duplicate_user_conflict(client):
    tenant_id = get_tenant_id(client)
    payload = {
        "email": "invited_user@example.com",
        "full_name": "Invited User",
        "role": "User",
    }
    dup_res = client.post(f"/api/v1/tenants/{tenant_id}/users", json=payload)
    assert dup_res.status_code == 409


def test_revoke_user_from_tenant(client):
    tenant_id = get_tenant_id(client)
    res = client.get(f"/api/v1/tenants/{tenant_id}/users")
    users = res.json()
    target_user = next(
        (u for u in users if u.get("email") == "invited_user@example.com"), users[-1]
    )
    user_id = target_user.get("user_id") or target_user.get("id")

    revoke_res = client.delete(f"/api/v1/tenants/{tenant_id}/users/{user_id}")
    assert revoke_res.status_code == 200
