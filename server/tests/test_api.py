from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "dg-cluster-assortment-advisor" in data["service"]


def test_get_kpi_header(client: TestClient):
    response = client.get("/api/v1/kpis?cluster_name=Small Town Value Cluster")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_name"] == "Small Town Value Cluster"
    assert data["sales_per_linear_ft"] == 1250.0
    assert data["private_brand_pct"] == 28.0
    assert data["in_stock_rate"] == 96.5
    assert data["shelf_capacity_pct"] == 92.0


def test_list_skus_default(client: TestClient):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 36
    assert len(data["items"]) == 36
    assert data["grow_count"] == 12
    assert data["maintain_count"] == 18
    assert data["swap_count"] == 4
    assert data["reduce_count"] == 2


def test_list_skus_filters(client: TestClient):
    # Filter by action badge
    response_grow = client.get("/api/v1/skus?action_badge=GROW")
    assert response_grow.status_code == 200
    assert len(response_grow.json()["items"]) == 12
    for item in response_grow.json()["items"]:
        assert item["action_badge"] == "GROW"

    # Filter by sub_category
    response_salty = client.get("/api/v1/skus?sub_category=Salty Snacks")
    assert response_salty.status_code == 200
    assert len(response_salty.json()["items"]) == 10

    # Filter by brand_type
    response_pb = client.get("/api/v1/skus?brand_type=Private Brand")
    assert response_pb.status_code == 200
    for item in response_pb.json()["items"]:
        assert item["brand_type"] == "Private Brand"

    # Search query
    response_search = client.get("/api/v1/skus?search=Doritos")
    assert response_search.status_code == 200
    assert len(response_search.json()["items"]) >= 1
    assert "Doritos" in response_search.json()["items"][0]["product_name"]


def test_get_single_sku(client: TestClient):
    response = client.get("/api/v1/skus/SNK-CV-001")
    assert response.status_code == 200
    data = response.json()
    assert data["sku_code"] == "SNK-CV-001"
    assert "Clover Valley Classic Potato Chips" in data["product_name"]
    assert data["action_badge"] == "GROW"
    assert data["brand_type"] == "Private Brand"

    # Test 404 for nonexistent SKU
    res_404 = client.get("/api/v1/skus/NONEXISTENT-SKU")
    assert res_404.status_code == 404


def test_create_and_update_sku(client: TestClient):
    new_sku = {
        "sku_code": "SNK-TEST-999",
        "product_name": "Test Snack Item 5oz",
        "sub_category": "Salty Snacks",
        "brand_type": "Private Brand",
        "sales_per_linear_ft": 1100.0,
        "margin_pct": 42.0,
        "units_sold": 2000,
        "action_badge": "GROW",
        "shelf_space_inches": 10.0,
        "current_stock": 40,
        "in_stock_rate": 96.0,
    }
    create_res = client.post("/api/v1/skus", json=new_sku)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["sku_code"] == "SNK-TEST-999"

    # Conflict on duplicate
    dup_res = client.post("/api/v1/skus", json=new_sku)
    assert dup_res.status_code == 409

    # Update the SKU
    update_res = client.put(
        f"/api/v1/skus/{created_data['id']}",
        json={"margin_pct": 45.0, "action_badge": "MAINTAIN"},
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["margin_pct"] == 45.0
    assert updated_data["action_badge"] == "MAINTAIN"


def test_list_scenarios(client: TestClient):
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    keys = [s["scenario_key"] for s in data]
    assert "conservative" in keys
    assert "balanced" in keys
    assert "aggressive" in keys

    balanced = next(s for s in data if s["scenario_key"] == "balanced")
    assert balanced["is_default"] is True
    assert balanced["projected_sales_lift_pct"] == 5.8
    assert balanced["projected_private_brand_pct"] == 30.5
    assert balanced["grow_count"] == 12


def test_evaluate_scenarios(client: TestClient):
    # Balanced (default)
    res_bal = client.post("/api/v1/scenarios/evaluate", json={"scenario": "Balanced"})
    assert res_bal.status_code == 200
    data_bal = res_bal.json()
    assert data_bal["display_name"] == "Balanced"
    assert data_bal["projected_sales_lift_pct"] == 5.8
    assert data_bal["projected_private_brand_pct"] == 30.5
    assert data_bal["sku_action_summary"]["GROW"] == 12
    assert data_bal["sku_action_summary"]["SWAP"] == 4

    # Conservative
    res_con = client.post(
        "/api/v1/scenarios/evaluate", json={"scenario": "Conservative"}
    )
    assert res_con.status_code == 200
    data_con = res_con.json()
    assert data_con["display_name"] == "Conservative"
    assert data_con["projected_sales_lift_pct"] == 3.2
    assert data_con["risk_level"] == "Low"

    # Aggressive
    res_agg = client.post("/api/v1/scenarios/evaluate", json={"scenario": "Aggressive"})
    assert res_agg.status_code == 200
    data_agg = res_agg.json()
    assert data_agg["display_name"] == "Aggressive"
    assert data_agg["projected_sales_lift_pct"] == 8.5
    assert data_agg["projected_private_brand_pct"] == 32.0


def test_check_guardrails(client: TestClient):
    response = client.post("/api/v1/guardrails/check", json={"scenario": "Balanced"})
    assert response.status_code == 200
    data = response.json()
    assert data["pass_all"] is True
    assert "Shelf capacity" in data["shelf_capacity_check"]
    assert "Private brand" in data["private_brand_check"]
    assert len(data["checks"]) == 4
    for check in data["checks"]:
        assert check["passed"] is True
        assert check["status"] == "PASSED"


def test_submit_approval_and_audit_trail(client: TestClient):
    payload = {
        "scenario": "Balanced",
        "cluster_name": "Small Town Value Cluster",
        "user_id": "category_mgr@dollargeneral.com",
        "notes": "Approved Q3 Small Town Value Snacks reset.",
    }
    submit_res = client.post("/api/v1/approvals/submit", json=payload)
    assert submit_res.status_code == 201
    submit_data = submit_res.json()
    assert submit_data["status"] == "APPROVED"
    assert submit_data["guardrail_status"] == "ALL PASSED"
    assert submit_data["audit_id"].startswith("AUD-")
    assert submit_data["total_modified_skus"] == 18
    assert "Assortment plan submitted successfully" in submit_data["message"]

    # Retrieve audit trail
    trail_res = client.get("/api/v1/approvals/audit-trail")
    assert trail_res.status_code == 200
    trail_data = trail_res.json()
    assert len(trail_data) >= 1
    audit_ids = [a["audit_id"] for a in trail_data]
    assert submit_data["audit_id"] in audit_ids


def test_auth_flow(client: TestClient):
    # Test valid login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "test@example.com"
    token = token_data["access_token"]

    # Test /auth/me with token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test@example.com"

    # Test admin login
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert admin_login.status_code == 200
    assert admin_login.json()["user"]["role"] == "admin"

    # Test invalid password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert bad_login.status_code == 401
