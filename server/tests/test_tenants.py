def test_onboard_tenant_success(client):
    payload = {
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "domain": "acme.com",
        "admin_email": "admin@acme.com",
        "admin_full_name": "Acme Admin",
    }
    response = client.post("/api/v1/tenants", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corporation"
    assert data["slug"] == "acme-corp"
    assert "id" in data


def test_onboard_tenant_duplicate_conflict(client):
    payload = {
        "name": "Acme Duplicate",
        "slug": "acme-corp",
        "domain": "acme.com",
        "admin_email": "admin2@acme.com",
    }
    response = client.post("/api/v1/tenants", json=payload)
    assert response.status_code == 409


def test_list_tenants(client):
    response = client.get("/api/v1/tenants")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_tenant_details(client):
    res = client.get("/api/v1/tenants")
    tenants = res.json()
    acme_tenant = next(
        (t for t in tenants if t["name"] == "Acme Corporation"), tenants[0]
    )
    tenant_id = acme_tenant["id"]

    response = client.get(f"/api/v1/tenants/{tenant_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == tenant_id
    assert data["name"] == acme_tenant["name"]


def test_update_tenant_status(client):
    res = client.get("/api/v1/tenants")
    tenants = res.json()
    tenant_id = tenants[0]["id"]

    patch_res = client.patch(
        f"/api/v1/tenants/{tenant_id}/status", json={"status": "Suspended"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Suspended"

    sub_res = client.get(
        f"/api/v1/tenants/{tenant_id}/config", headers={"X-Tenant-ID": tenant_id}
    )
    assert sub_res.status_code == 403

    patch_res2 = client.patch(
        f"/api/v1/tenants/{tenant_id}/status", json={"status": "Active"}
    )
    assert patch_res2.status_code == 200
