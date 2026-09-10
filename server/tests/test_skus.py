def test_get_all_skus(client):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 20
    first = data[0]
    assert "sku_code" in first
    assert "product_name" in first
    assert "status_badge" in first
    assert first["status_badge"] in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]


def test_filter_skus_by_private_brand(client):
    response = client.get("/api/v1/skus?is_private_brand=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(sku["is_private_brand"] is True for sku in data)


def test_filter_skus_by_status_badge(client):
    response = client.get("/api/v1/skus?status_badge=GROW")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(sku["status_badge"] == "GROW" for sku in data)


def test_search_skus(client):
    response = client.get("/api/v1/skus?search=Potato")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any("Potato" in sku["product_name"] for sku in data)


def test_create_and_update_and_delete_sku(client):
    # 1. Create
    new_sku = {
        "sku_code": "SKU-TEST-999",
        "product_name": "Test Snack Crisps 6oz",
        "category": "Snacks",
        "cluster_id": "Small Town Value Cluster",
        "is_private_brand": True,
        "weekly_units_sold": 200.0,
        "sales_per_linear_ft": 1100.0,
        "margin_percentage": 40.0,
        "linear_ft_allocated": 2.0,
        "status_badge": "GROW"
    }
    create_resp = client.post("/api/v1/skus", json=new_sku)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    sku_id = created_data["id"]

    # 2. Get by ID
    get_resp = client.get(f"/api/v1/skus/{sku_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["sku_code"] == "SKU-TEST-999"

    # 3. Patch
    patch_resp = client.patch(f"/api/v1/skus/{sku_id}", json={"status_badge": "MAINTAIN"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status_badge"] == "MAINTAIN"

    # 4. Delete
    del_resp = client.delete(f"/api/v1/skus/{sku_id}")
    assert del_resp.status_code == 204

    # 5. Confirm 404
    get_del = client.get(f"/api/v1/skus/{sku_id}")
    assert get_del.status_code == 404
