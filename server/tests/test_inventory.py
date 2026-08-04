def test_get_inventory_default(client):
    response = client.get("/api/v1/inventory")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) >= 1
    first_item = data["items"][0]
    assert "sku" in first_item
    assert "quantity_on_hand" in first_item
    assert "is_low_stock" in first_item


def test_get_inventory_filter_by_sku(client):
    response = client.get("/api/v1/inventory?sku=SKU-9901")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["sku"] == "SKU-9901" for item in data["items"])
