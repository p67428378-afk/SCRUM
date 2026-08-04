import uuid


def test_list_and_update_alerts(client):
    # 1. Trigger an alert
    cat_res = client.post("/api/v1/categories", json={"name": f"Cat-{uuid.uuid4()}"})
    cat_id = cat_res.json()["id"]

    wh_res = client.post(
        "/api/v1/warehouses",
        json={"code": f"WH-{uuid.uuid4().hex[:4].upper()}", "name": "Warehouse C"},
    )
    wh_id = wh_res.json()["id"]

    item_res = client.post(
        "/api/v1/items",
        json={
            "sku": f"SKU-{uuid.uuid4().hex[:6].upper()}",
            "name": "Alert Item",
            "category_id": cat_id,
            "unit_price": 50.0,
            "reorder_threshold": 20,
            "reorder_quantity": 100,
        },
    )
    item_id = item_res.json()["id"]

    client.post(
        "/api/v1/stock-adjustments",
        json={
            "item_id": item_id,
            "warehouse_id": wh_id,
            "quantity_change": 5,
            "reason_code": "INITIAL_LOW_STOCK",
        },
    )

    alerts_res = client.get("/api/v1/alerts?status=ACTIVE")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()["alerts"]
    target_alert = next((a for a in alerts if a["item_id"] == item_id), None)
    assert target_alert is not None
    alert_id = target_alert["id"]

    # 2. Acknowledge alert
    update_res = client.put(
        f"/api/v1/alerts/{alert_id}", json={"status": "ACKNOWLEDGED"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "ACKNOWLEDGED"
