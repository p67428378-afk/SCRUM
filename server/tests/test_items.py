def test_create_item(client):
    payload = {
        "sku": "R-001",
        "name": "Diamond Ring",
        "description": "A beautiful ring",
        "material": "Gold",
        "carat_weight": 1.5,
        "gemstone_type": "Diamond",
        "price": 5000.00,
        "quantity": 5,
    }
    response = client.post("/api/v1/items", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "R-001"
    assert data["name"] == "Diamond Ring"
    assert data["price"] == 5000.00
    assert data["quantity"] == 5
    assert data["low_stock"] is False
    assert "id" in data


def test_create_item_duplicate_sku(client):
    payload = {"sku": "R-001", "name": "Diamond Ring", "price": 5000.00, "quantity": 5}
    response = client.post("/api/v1/items", json=payload)
    assert response.status_code == 201

    # Try to create again with same SKU
    response2 = client.post("/api/v1/items", json=payload)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "SKU already exists"


def test_create_item_invalid_data(client):
    # Missing required fields
    payload = {"sku": "R-001"}
    response = client.post("/api/v1/items", json=payload)
    assert response.status_code == 422

    # Negative price
    payload2 = {"sku": "R-001", "name": "Diamond Ring", "price": -100.00, "quantity": 5}
    response2 = client.post("/api/v1/items", json=payload2)
    assert response2.status_code == 422


def test_get_items_pagination_and_filtering(client):
    # Create 3 items
    items = [
        {
            "sku": "R-001",
            "name": "Diamond Ring",
            "material": "Gold",
            "gemstone_type": "Diamond",
            "price": 5000.00,
            "quantity": 10,
        },
        {
            "sku": "N-001",
            "name": "Sapphire Necklace",
            "material": "Platinum",
            "gemstone_type": "Sapphire",
            "price": 8000.00,
            "quantity": 3,
        },
        {
            "sku": "E-001",
            "name": "Emerald Earrings",
            "material": "Gold",
            "gemstone_type": "Emerald",
            "price": 3000.00,
            "quantity": 1,
        },
    ]
    for item in items:
        client.post("/api/v1/items", json=item)

    # Get all items
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3

    # Test low stock flag
    # R-001 has qty 10 -> low_stock False
    # N-001 has qty 3 -> low_stock True
    # E-001 has qty 1 -> low_stock True
    items_by_sku = {item["sku"]: item for item in data["items"]}
    assert items_by_sku["R-001"]["low_stock"] is False
    assert items_by_sku["N-001"]["low_stock"] is True
    assert items_by_sku["E-001"]["low_stock"] is True

    # Test search
    response_search = client.get("/api/v1/items?search=Necklace")
    assert response_search.status_code == 200
    data_search = response_search.json()
    assert data_search["total"] == 1
    assert data_search["items"][0]["sku"] == "N-001"

    # Test material filter
    response_material = client.get("/api/v1/items?material=Gold")
    assert response_material.status_code == 200
    data_material = response_material.json()
    assert data_material["total"] == 2

    # Test sorting by price desc
    response_sort = client.get("/api/v1/items?sort_by=price&sort_order=desc")
    assert response_sort.status_code == 200
    data_sort = response_sort.json()
    assert data_sort["items"][0]["sku"] == "N-001"  # 8000.00
    assert data_sort["items"][1]["sku"] == "R-001"  # 5000.00
    assert data_sort["items"][2]["sku"] == "E-001"  # 3000.00

    # Test pagination
    response_page = client.get("/api/v1/items?skip=1&limit=1")
    assert response_page.status_code == 200
    data_page = response_page.json()
    assert len(data_page["items"]) == 1
    assert data_page["total"] == 3


def test_get_single_item(client):
    payload = {"sku": "R-001", "name": "Diamond Ring", "price": 5000.00, "quantity": 5}
    create_resp = client.post("/api/v1/items", json=payload)
    item_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/items/{item_id}")
    assert response.status_code == 200
    assert response.json()["sku"] == "R-001"

    # Get by SKU directly
    response_sku = client.get("/api/v1/items/R-001")
    assert response_sku.status_code == 200
    assert response_sku.json()["id"] == item_id

    # Not found
    response_nf = client.get("/api/v1/items/non-existent-id")
    assert response_nf.status_code == 404


def test_update_item(client):
    payload = {"sku": "R-001", "name": "Diamond Ring", "price": 5000.00, "quantity": 5}
    create_resp = client.post("/api/v1/items", json=payload)
    item_id = create_resp.json()["id"]

    update_payload = {"price": 5500.00, "quantity": 4}
    response = client.put(f"/api/v1/items/{item_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 5500.00
    assert data["quantity"] == 4
    assert data["low_stock"] is True  # quantity is now 4, which is < 5

    # Update by SKU directly
    update_payload_sku = {"name": "Super Diamond Ring"}
    response_sku = client.put("/api/v1/items/R-001", json=update_payload_sku)
    assert response_sku.status_code == 200
    assert response_sku.json()["name"] == "Super Diamond Ring"


def test_delete_item(client):
    payload = {"sku": "R-001", "name": "Diamond Ring", "price": 5000.00, "quantity": 5}
    create_resp = client.post("/api/v1/items", json=payload)
    item_id = create_resp.json()["id"]

    # Delete by SKU directly
    response = client.delete("/api/v1/items/R-001")
    assert response.status_code == 204

    # Verify deleted
    response_get = client.get(f"/api/v1/items/{item_id}")
    assert response_get.status_code == 404


def test_make_sale(client):
    payload = {"sku": "R-001", "name": "Diamond Ring", "price": 5000.00, "quantity": 5}
    create_resp = client.post("/api/v1/items", json=payload)
    item_id = create_resp.json()["id"]

    # Make a sale of 2 items by SKU directly
    response = client.post("/api/v1/items/R-001/sale?quantity_sold=2")
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 3
    assert data["low_stock"] is True
