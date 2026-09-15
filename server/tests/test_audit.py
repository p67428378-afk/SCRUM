def get_or_create_tenant_id(client):
    res = client.get("/api/v1/tenants")
    tenants = res.json()
    if tenants:
        return tenants[0]["id"]
    create_res = client.post(
        "/api/v1/tenants",
        json={
            "name": "Audit Tenant",
            "slug": "audit-tenant",
            "domain": "audittenant.com",
        },
    )
    return create_res.json()["id"]


def test_get_tenant_audit_logs(client):
    tenant_id = get_or_create_tenant_id(client)
    response = client.get(f"/api/v1/tenants/{tenant_id}/audit-logs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
