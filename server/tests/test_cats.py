def test_list_cats_default(client):
    response = client.get("/api/v1/cats")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["skip"] == 0
    assert data["limit"] == 20
    assert len(data["items"]) >= 1


def test_list_cats_filtering(client):
    # Filter by breed
    response = client.get("/api/v1/cats?breed=Siamese")
    assert response.status_code == 200
    items = response.json()["items"]
    assert all("Siamese" in c["breed"] for c in items)

    # Filter by gender
    response = client.get("/api/v1/cats?gender=Female")
    assert response.status_code == 200
    items = response.json()["items"]
    assert all(c["gender"].lower() == "female" for c in items)

    # Filter by age group Kitten (<6m)
    response = client.get("/api/v1/cats?age_group=Kitten")
    assert response.status_code == 200
    items = response.json()["items"]
    assert all(c["age_months"] < 6 for c in items)

    # Filter by price range
    response = client.get("/api/v1/cats?min_price=300&max_price=450")
    assert response.status_code == 200
    items = response.json()["items"]
    assert all(300 <= c["price"] <= 450 for c in items)


def test_list_cats_search_empty_state(client):
    response = client.get("/api/v1/cats?search=NonExistentBreed12345")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_get_cat_detail_success(client):
    # First get list of cats
    list_res = client.get("/api/v1/cats")
    cats = list_res.json()["items"]
    assert len(cats) > 0
    cat_id = cats[0]["id"]

    # Get cat detail
    response = client.get(f"/api/v1/cats/{cat_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == cat_id
    assert "seller" in data
    assert "email" in data["seller"]


def test_get_cat_detail_not_found(client):
    response = client.get("/api/v1/cats/non-existent-uuid-12345")
    assert response.status_code == 404
    assert response.json()["detail"] == "Cat not found"


def test_create_cat_seller_success(client, seller_headers):
    response = client.post(
        "/api/v1/cats",
        headers=seller_headers,
        json={
            "name": "Simba",
            "breed": "Bengal",
            "age_months": 5,
            "gender": "Male",
            "price": 750.0,
            "description": "Energetic Bengal kitten with beautiful spots.",
            "image_url": "https://example.com/simba.jpg",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Simba"
    assert data["breed"] == "Bengal"
    assert data["status"] == "Available"


def test_create_cat_forbidden_for_buyer(client, buyer_headers):
    response = client.post(
        "/api/v1/cats",
        headers=buyer_headers,
        json={
            "name": "Simba",
            "breed": "Bengal",
            "age_months": 5,
            "gender": "Male",
            "price": 750.0,
            "description": "Energetic Bengal kitten.",
        },
    )
    assert response.status_code == 403


def test_update_and_delete_cat(client, seller_headers):
    # Create cat first
    create_res = client.post(
        "/api/v1/cats",
        headers=seller_headers,
        json={
            "name": "TempCat",
            "breed": "Ragdoll",
            "age_months": 2,
            "gender": "Female",
            "price": 500.0,
            "description": "Fluffy Ragdoll kitten.",
        },
    )
    cat_id = create_res.json()["id"]

    # Update cat
    update_res = client.put(
        f"/api/v1/cats/{cat_id}",
        headers=seller_headers,
        json={"price": 450.0, "status": "Sold"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 450.0
    assert update_res.json()["status"] == "Sold"

    # Delete cat
    delete_res = client.delete(f"/api/v1/cats/{cat_id}", headers=seller_headers)
    assert delete_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/v1/cats/{cat_id}")
    assert get_res.status_code == 404
