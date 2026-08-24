def get_token(client, email, password):
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    return response.json()["access_token"]


def test_list_low_stock(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/inventory/low-stock", headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Fuji Apples has current_stock=15, reorder_threshold=20, so it should be low stock
    assert len(data) >= 1
    assert any(item["sku"] == "PROD-APL-001" for item in data)


def test_update_stock_success(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    update_data = {"current_stock": 120.0, "reorder_threshold": 25.0}

    response = client.put(
        f"/api/v1/inventory/{item_id}", json=update_data, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert float(data["current_stock"]) == 120.0
    assert float(data["reorder_threshold"]) == 25.0


def test_update_stock_negative_value(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    update_data = {"current_stock": -10.0, "reorder_threshold": 25.0}

    response = client.put(
        f"/api/v1/inventory/{item_id}", json=update_data, headers=headers
    )
    # Pydantic validation ge=0 will trigger 422 Unprocessable Entity
    assert response.status_code == 422


def test_adjust_stock_success(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    adj_data = {
        "adjustment_type": "Damage",
        "quantity_changed": -5.0,
        "reason": "Spoiled apples removed from display",
    }

    response = client.post(
        f"/api/v1/inventory/{item_id}/adjust", json=adj_data, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["adjustment_type"] == "Damage"
    assert float(data["quantity_changed"]) == -5.0
    assert float(data["new_stock"]) == 10.0  # 15.0 - 5.0 = 10.0


def test_adjust_stock_zero_blocked(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    adj_data = {
        "adjustment_type": "Damage",
        "quantity_changed": 0.0,
        "reason": "No change",
    }

    response = client.post(
        f"/api/v1/inventory/{item_id}/adjust", json=adj_data, headers=headers
    )
    assert response.status_code == 422


def test_adjust_stock_negative_result_blocked(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    adj_data = {
        "adjustment_type": "Damage",
        "quantity_changed": -20.0,  # Fuji Apples has 15.0, so -20.0 results in -5.0
        "reason": "Too many spoiled apples",
    }

    response = client.post(
        f"/api/v1/inventory/{item_id}/adjust", json=adj_data, headers=headers
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Adjustment results in a negative stock level."
