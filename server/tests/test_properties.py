def test_get_properties_list(client):
    response = client.get("/api/v1/properties")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_search_properties_by_city(client):
    response = client.get("/api/v1/properties?city=Austin")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert "Austin" in item["city"]


def test_filter_properties_by_price_and_beds(client):
    response = client.get(
        "/api/v1/properties?min_price=300000&max_price=500000&bedrooms=2"
    )
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert 300000 <= item["price"] <= 500000
        assert item["bedrooms"] >= 2


def test_get_property_detail(client):
    list_res = client.get("/api/v1/properties")
    assert list_res.status_code == 200
    properties = list_res.json()["items"]
    assert len(properties) > 0
    prop_id = properties[0]["id"]

    detail_res = client.get(f"/api/v1/properties/{prop_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == prop_id
    assert "owner_agent" in detail
    assert "images" in detail
    assert "amenities" in detail


def test_create_update_delete_property(client, test_agent_token):
    headers = {"Authorization": f"Bearer {test_agent_token}"}

    # 1. Create property
    create_payload = {
        "title": "New Test Suburban Home",
        "description": "Spacious house with large backyard and garage.",
        "property_type": "single_family",
        "status": "Active",
        "price": 520000.0,
        "bedrooms": 4,
        "bathrooms": 3.0,
        "square_feet": 2800,
        "address_street": "789 Oak Ave",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78704",
        "latitude": 30.2500,
        "longitude": -97.7500,
        "amenities": ["Garage", "Pool"],
        "images": ["https://images.unsplash.com/photo-1570129477492-45c003edd2be"],
    }
    create_res = client.post("/api/v1/properties", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    created_prop = create_res.json()
    prop_id = created_prop["id"]
    assert created_prop["title"] == "New Test Suburban Home"

    # 2. Add image
    img_res = client.post(
        f"/api/v1/properties/{prop_id}/images",
        json={
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "display_order": 1,
        },
        headers=headers,
    )
    assert img_res.status_code == 201

    # 3. Update property
    update_res = client.put(
        f"/api/v1/properties/{prop_id}",
        json={"price": 499000.0, "status": "Pending"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 499000.0
    assert update_res.json()["status"] == "Pending"

    # 4. Delete property
    del_res = client.delete(f"/api/v1/properties/{prop_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/v1/properties/{prop_id}")
    assert get_res.status_code == 404


def test_unauthorized_property_modification(client, test_buyer_token):
    # Buyer tries to modify agent's property
    list_res = client.get("/api/v1/properties")
    prop_id = list_res.json()["items"][0]["id"]

    headers = {"Authorization": f"Bearer {test_buyer_token}"}
    update_res = client.put(
        f"/api/v1/properties/{prop_id}", json={"title": "Hacked Title"}, headers=headers
    )
    assert update_res.status_code == 403
