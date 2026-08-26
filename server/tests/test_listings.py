def get_auth_headers(client, email="test@example.com", password="testpassword"):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_listings(client):
    response = client.get("/api/v1/listings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3


def test_filter_listings_by_breed(client):
    response = client.get("/api/v1/listings?breed=Golden Retriever")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Golden" in data[0]["breed"]


def test_filter_listings_by_price_and_age(client):
    response = client.get(
        "/api/v1/listings?min_price=1000&max_price=2000&min_age=2&max_age=6"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_filter_listings_by_location(client):
    response = client.get("/api/v1/listings?location=Seattle")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Seattle" in data[0]["location"]


def test_filter_listings_by_min_rating(client):
    response = client.get("/api/v1/listings?min_rating=4.5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_create_get_update_delete_listing(client):
    headers = get_auth_headers(client)

    # 1. Create listing
    create_resp = client.post(
        "/api/v1/listings",
        headers=headers,
        json={
            "title": "Poodle Puppy - Coco",
            "breed": "Poodle",
            "age_months": 2,
            "price": 1800.0,
            "location": "Portland, OR",
            "description": "Adorable toy poodle puppy, hypoallergenic.",
            "health_records": "Vaccinated, Dewormed",
            "photo_urls": ["https://example.com/poodle.jpg"],
            "status": "available",
        },
    )
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    listing_id = created_data["id"]
    assert created_data["title"] == "Poodle Puppy - Coco"

    # 2. Get listing by id
    get_resp = client.get(f"/api/v1/listings/{listing_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == listing_id

    # 3. Update listing
    update_resp = client.put(
        f"/api/v1/listings/{listing_id}",
        headers=headers,
        json={
            "price": 1650.0,
            "status": "pending",
        },
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["price"] == 1650.0
    assert update_resp.json()["status"] == "pending"

    # 4. Delete listing
    delete_resp = client.delete(
        f"/api/v1/listings/{listing_id}",
        headers=headers,
    )
    assert delete_resp.status_code == 204

    # 5. Confirm deletion
    get_after_delete = client.get(f"/api/v1/listings/{listing_id}")
    assert get_after_delete.status_code == 404


def test_get_listing_not_found(client):
    response = client.get("/api/v1/listings/nonexistent-id-123")
    assert response.status_code == 404
