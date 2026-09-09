def test_get_inventory_alerts(client):
    response = client.get("/api/v1/inventory/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Dragonwell stock is 350g (min threshold 500g), so it should be in alerts
    alert_names = [a["name"] for t in data for a in [t]]
    assert "Dragonwell Green Tea" in alert_names


def test_adjust_inventory_restock(client):
    # Get Dragonwell Tea ID
    res = client.get("/api/v1/teas")
    dragonwell = next(t for t in res.json() if t["name"] == "Dragonwell Green Tea")

    adjust_payload = {
        "tea_id": dragonwell["id"],
        "change_grams": 500.0,
        "reason": "RESTOCK",
    }
    response = client.post("/api/v1/inventory/adjust", json=adjust_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["change_grams"] == 500.0

    # Verify updated stock
    updated_res = client.get(f"/api/v1/teas/{dragonwell['id']}")
    assert updated_res.json()["current_stock_grams"] == 850.0


def test_adjust_inventory_insufficient_stock(client):
    res = client.get("/api/v1/teas")
    dragonwell = next(t for t in res.json() if t["name"] == "Dragonwell Green Tea")

    adjust_payload = {
        "tea_id": dragonwell["id"],
        "change_grams": -10000.0,
        "reason": "SPOILAGE",
    }
    response = client.post("/api/v1/inventory/adjust", json=adjust_payload)
    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]
