def get_or_create_tenant_id(client):
    res = client.get("/api/v1/tenants")
    tenants = res.json()
    if tenants:
        return tenants[0]["id"]
    create_res = client.post(
        "/api/v1/tenants",
        json={
            "name": "Config Tenant",
            "slug": "config-tenant",
            "domain": "configtenant.com",
        },
    )
    return create_res.json()["id"]


def test_get_tenant_config(client):
    tenant_id = get_or_create_tenant_id(client)
    response = client.get(f"/api/v1/tenants/{tenant_id}/config")
    assert response.status_code == 200
    data = response.json()
    assert "rate_limit_rpm" in data
    assert "storage_quota_gb" in data


def test_update_tenant_config(client):
    tenant_id = get_or_create_tenant_id(client)
    payload = {
        "rate_limit_rpm": 2000,
        "storage_quota_gb": 100,
        "feature_flags": {"beta_access": True},
    }
    response = client.put(f"/api/v1/tenants/{tenant_id}/config", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["rate_limit_rpm"] == 2000
    assert data["storage_quota_gb"] == 100
    assert data["feature_flags"]["beta_access"] is True
