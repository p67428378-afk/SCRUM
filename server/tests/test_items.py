def get_token(client, email, password):
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    return response.json()["access_token"]


def test_list_items(client):
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(item["sku"] == "PROD-APL-001" for item in data)


def test_list_items_with_filter(client):
    response = client.get("/api/v1/items?category=Produce")
    assert response.status_code == 200
    data = response.json()
    assert all(item["category"] == "Produce" for item in data)


def test_list_items_with_search(client):
    response = client.get("/api/v1/items?search=Milk")
    assert response.status_code == 200
    data = response.json()
    assert any("Milk" in item["name"] for item in data)


def test_create_item_success(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    item_data = {
        "sku": "PROD-ORG-005",
        "name": "Navel Oranges",
        "category": "Produce",
        "unit_price": 3.49,
        "cost_price": 1.80,
        "unit_of_measure": "kg",
        "supplier_name": "Fresh Farms Co.",
        "initial_stock": 50.0,
        "reorder_threshold": 15.0,
    }

    response = client.post("/api/v1/items", json=item_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "PROD-ORG-005"
    assert data["name"] == "Navel Oranges"


def test_create_item_duplicate_sku(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    item_data = {
        "sku": "PROD-APL-001",  # Already exists in seeded data
        "name": "Another Apple",
        "category": "Produce",
        "unit_price": 2.99,
        "cost_price": 1.50,
        "unit_of_measure": "kg",
        "supplier_name": "Fresh Farms Co.",
    }

    response = client.post("/api/v1/items", json=item_data, headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "SKU already exists."


def test_create_item_unauthorized(client):
    # Staff role should be forbidden
    token = get_token(client, "staff@example.com", "staffpassword")
    headers = {"Authorization": f"Bearer {token}"}

    item_data = {
        "sku": "PROD-ORG-005",
        "name": "Navel Oranges",
        "category": "Produce",
        "unit_price": 3.49,
        "cost_price": 1.80,
        "unit_of_measure": "kg",
        "supplier_name": "Fresh Farms Co.",
    }

    response = client.post("/api/v1/items", json=item_data, headers=headers)
    assert response.status_code == 403


def test_update_item_success(client):
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    # Get an item ID first
    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    update_data = {"name": "Fuji Apples Premium", "unit_price": 3.99}

    response = client.put(f"/api/v1/items/{item_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Fuji Apples Premium"
    assert float(data["unit_price"]) == 3.99


def test_delete_item_success(client):
    # Manager can delete
    token = get_token(client, "test@example.com", "testpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    response = client.delete(f"/api/v1/items/{item_id}", headers=headers)
    assert response.status_code == 204

    # Verify it is soft deleted (not returned in list)
    items_response_after = client.get("/api/v1/items")
    assert not any(item["id"] == item_id for item in items_response_after.json())


def test_delete_item_forbidden_for_staff(client):
    token = get_token(client, "staff@example.com", "staffpassword")
    headers = {"Authorization": f"Bearer {token}"}

    items_response = client.get("/api/v1/items")
    item_id = items_response.json()[0]["id"]

    response = client.delete(f"/api/v1/items/{item_id}", headers=headers)
    assert response.status_code == 403
