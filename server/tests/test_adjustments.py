import uuid


def test_stock_adjustment_shipment(client):
    # Get seeded item SKU-9901 and Warehouse A
    inv = client.get("/api/v1/inventory?sku=SKU-9901").json()
    item = inv["items"][0]
    item_id = item["item_id"]
    warehouse_id = item["warehouse_id"]
    initial_qty = item["quantity_on_hand"]

    payload = {
        "item_id": item_id,
        "warehouse_id": warehouse_id,
        "quantity_change": 50,
        "reason_code": "SHIPMENT_ARRIVED",
        "notes": "Incoming shipment of 50 units",
    }

    res = client.post("/api/v1/stock-adjustments", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["previous_quantity"] == initial_qty
    assert data["new_quantity"] == initial_qty + 50
    assert data["reason_code"] == "SHIPMENT_ARRIVED"
    assert data["alert_triggered"] is False


def test_stock_adjustment_damaged_triggers_alert(client):
    # Create item with threshold 10
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    wh_res = client.post(
        "/api/v1/warehouses",
        json={"code": f"WH-{uuid.uuid4().hex[:4].upper()}", "name": "Warehouse B"},
    )
    wh_id = wh_res.json()["id"]

    item_res = client.post(
        "/api/v1/items",
        json={
            "sku": f"SKU-{uuid.uuid4().hex[:6].upper()}",
            "name": "Low Stock Widget",
            "category_id": cat_id,
            "unit_price": 100.0,
            "reorder_threshold": 10,
            "reorder_quantity": 50,
        },
    )
    item_id = item_res.json()["id"]

    # Initial stock +15
    client.post(
        "/api/v1/stock-adjustments",
        json={
            "item_id": item_id,
            "warehouse_id": wh_id,
            "quantity_change": 15,
            "reason_code": "INITIAL_STOCK",
        },
    )

    # Adjust -8 -> new quantity 7 (<= threshold 10)
    adj_res = client.post(
        "/api/v1/stock-adjustments",
        json={
            "item_id": item_id,
            "warehouse_id": wh_id,
            "quantity_change": -8,
            "reason_code": "DAMAGED_GOODS",
            "notes": "Units damaged",
        },
    )
    assert adj_res.status_code == 200
    data = adj_res.json()
    assert data["new_quantity"] == 7
    assert data["alert_triggered"] is True

    # Check alert endpoint
    alerts_res = client.get("/api/v1/alerts?status=ACTIVE")
    assert alerts_res.status_code == 200
    active_alerts = alerts_res.json()["alerts"]
    assert any(
        a["item_id"] == item_id and a["current_quantity"] == 7 for a in active_alerts
    )


def test_stock_transfer_between_warehouses(client):
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    wh1_res = client.post(
        "/api/v1/warehouses",
        json={
            "code": f"WH1-{uuid.uuid4().hex[:4].upper()}",
            "name": "Warehouse Source",
        },
    )
    wh1_id = wh1_res.json()["id"]

    wh2_res = client.post(
        "/api/v1/warehouses",
        json={
            "code": f"WH2-{uuid.uuid4().hex[:4].upper()}",
            "name": "Warehouse Target",
        },
    )
    wh2_id = wh2_res.json()["id"]

    item_res = client.post(
        "/api/v1/items",
        json={
            "sku": f"SKU-{uuid.uuid4().hex[:6].upper()}",
            "name": "Transfer Widget",
            "category_id": cat_id,
            "unit_price": 75.0,
            "reorder_threshold": 5,
            "reorder_quantity": 30,
        },
    )
    item_id = item_res.json()["id"]

    # Initial stock in WH1
    client.post(
        "/api/v1/stock-adjustments",
        json={
            "item_id": item_id,
            "warehouse_id": wh1_id,
            "quantity_change": 100,
            "reason_code": "INITIAL_STOCK",
        },
    )

    # Transfer 30 units from WH1 to WH2
    transfer_res = client.post(
        "/api/v1/stock-transfers",
        json={
            "item_id": item_id,
            "from_warehouse_id": wh1_id,
            "to_warehouse_id": wh2_id,
            "quantity": 30,
            "notes": "Transfer 30 units to balance inventory",
        },
    )
    assert transfer_res.status_code == 200
    data = transfer_res.json()
    assert data["quantity"] == 30
    assert data["from_warehouse_id"] == wh1_id
    assert data["to_warehouse_id"] == wh2_id

    # Check stock in WH1 is now 70 and WH2 is 30
    inv1 = client.get(f"/api/v1/inventory?warehouse_id={wh1_id}").json()["items"][0]
    inv2 = client.get(f"/api/v1/inventory?warehouse_id={wh2_id}").json()["items"][0]
    assert inv1["quantity_on_hand"] == 70
    assert inv2["quantity_on_hand"] == 30


def test_list_stock_adjustments(client):
    res = client.get("/api/v1/stock-adjustments")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "adjustments" in data
    assert isinstance(data["adjustments"], list)
