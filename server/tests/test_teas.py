def test_list_teas(client):
    response = client.get("/api/v1/teas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Verify sample seeded tea exists
    names = [t["name"] for t in data]
    assert "Dragonwell Green Tea" in names


def test_create_tea(client):
    new_tea = {
        "name": "Matcha Ceremonial Grade",
        "category": "Green Tea",
        "current_stock_grams": 1000.0,
        "min_threshold_grams": 300.0,
        "unit_price": 35.00,
        "supplier_name": "Uji Matcha Co.",
    }
    response = client.post("/api/v1/teas", json=new_tea)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Matcha Ceremonial Grade"
    assert "id" in data


def test_create_duplicate_tea(client):
    duplicate_tea = {
        "name": "Dragonwell Green Tea",
        "category": "Green Tea",
        "current_stock_grams": 500.0,
        "unit_price": 18.50,
    }
    response = client.post("/api/v1/teas", json=duplicate_tea)
    assert response.status_code == 400


def test_get_tea_by_id(client):
    # Get list first to grab an ID
    res = client.get("/api/v1/teas")
    tea_id = res.json()[0]["id"]

    response = client.get(f"/api/v1/teas/{tea_id}")
    assert response.status_code == 200
    assert response.json()["id"] == tea_id


def test_get_tea_not_found(client):
    response = client.get("/api/v1/teas/non-existent-id")
    assert response.status_code == 404
