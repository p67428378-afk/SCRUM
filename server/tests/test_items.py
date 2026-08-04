import uuid


def test_create_item_success(client):
    # First create category
    cat_res = client.post(
        "/api/v1/categories",
        json={"name": f"Cat-{uuid.uuid4()}", "description": "Test"},
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
    payload = {
        "sku": sku,
        "name": "Widget Beta",
        "category_id": cat_id,
        "unit_price": 29.99,
        "reorder_threshold": 5,
        "reorder_quantity": 20,
    }
    response = client.post("/api/v1/items", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == sku
    assert data["name"] == "Widget Beta"
    assert data["unit_price"] == 29.99


def test_create_item_duplicate_sku(client):
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    sku = f"DUP-{uuid.uuid4().hex[:6].upper()}"
    payload = {
        "sku": sku,
        "name": "Widget Duplicate",
        "category_id": cat_id,
        "unit_price": 10.00,
        "reorder_threshold": 5,
        "reorder_quantity": 20,
    }
    r1 = client.post("/api/v1/items", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/api/v1/items", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]


def test_list_items(client):
    response = client.get("/api/v1/items?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)


def test_get_item_by_id(client):
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
    payload = {
        "sku": sku,
        "name": "Item Get Test",
        "category_id": cat_id,
        "unit_price": 15.00,
        "reorder_threshold": 2,
        "reorder_quantity": 10,
    }
    r = client.post("/api/v1/items", json=payload)
    item_id = r.json()["id"]

    r_get = client.get(f"/api/v1/items/{item_id}")
    assert r_get.status_code == 200
    assert r_get.json()["sku"] == sku


def test_update_item(client):
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
    r = client.post(
        "/api/v1/items",
        json={
            "sku": sku,
            "name": "Item Before Update",
            "category_id": cat_id,
            "unit_price": 10.00,
            "reorder_threshold": 5,
            "reorder_quantity": 20,
        },
    )
    item_id = r.json()["id"]

    r_update = client.put(
        f"/api/v1/items/{item_id}",
        json={"name": "Item After Update", "unit_price": 12.50},
    )
    assert r_update.status_code == 200
    assert r_update.json()["name"] == "Item After Update"
    assert r_update.json()["unit_price"] == 12.50
