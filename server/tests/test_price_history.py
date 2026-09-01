def test_create_property_logs_listed_event(client):
    payload = {
        "title": "Test Listing House",
        "description": "Brand new test listing",
        "price": 300000.0,
        "city": "Austin",
        "zip_code": "78701",
        "sqft": 1000,
        "bedrooms": 2,
        "bathrooms": 2.0,
        "status": "Active",
    }
    response = client.post("/api/v1/properties", json=payload)
    assert response.status_code == 201
    prop_data = response.json()
    prop_id = prop_data["id"]

    history_resp = client.get(f"/api/v1/properties/{prop_id}/price-history")
    assert history_resp.status_code == 200
    history_data = history_resp.json()
    assert history_data["property_id"] == prop_id
    history_list = history_data["history"]
    assert len(history_list) == 1
    assert history_list[0]["change_event"] == "listed"
    assert history_list[0]["price"] == 300000.0


def test_update_property_price_logs_price_drop_and_increase(client):
    # 1. Create property
    payload = {
        "title": "Price Drop House",
        "price": 500000.0,
        "city": "Austin",
        "zip_code": "78701",
        "sqft": 1500,
    }
    res_create = client.post("/api/v1/properties", json=payload)
    assert res_create.status_code == 201
    prop_id = res_create.json()["id"]

    # 2. Price drop
    res_drop = client.put(f"/api/v1/properties/{prop_id}", json={"price": 475000.0})
    assert res_drop.status_code == 200
    assert res_drop.json()["price"] == 475000.0

    # 3. Price increase
    res_inc = client.put(f"/api/v1/properties/{prop_id}", json={"price": 490000.0})
    assert res_inc.status_code == 200
    assert res_inc.json()["price"] == 490000.0

    # 4. Unchanged price update (title change only)
    res_same = client.put(
        f"/api/v1/properties/{prop_id}", json={"title": "Updated Title Only"}
    )
    assert res_same.status_code == 200

    # Verify history
    history_resp = client.get(f"/api/v1/properties/{prop_id}/price-history")
    assert history_resp.status_code == 200
    history_list = history_resp.json()["history"]
    assert len(history_list) == 3
    assert history_list[0]["change_event"] == "listed"
    assert history_list[0]["price"] == 500000.0
    assert history_list[1]["change_event"] == "price_drop"
    assert history_list[1]["price"] == 475000.0
    assert history_list[2]["change_event"] == "price_increase"
    assert history_list[2]["price"] == 490000.0


def test_price_history_not_found(client):
    response = client.get("/api/v1/properties/invalid-uuid-9999/price-history")
    assert response.status_code == 404
