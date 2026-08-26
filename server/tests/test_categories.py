def test_list_predefined_categories(client):
    # AC: Users can select from predefined categories (e.g., Food, Transport, Utilities, Entertainment, Income)
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    names = [c["name"] for c in data]
    assert "Food" in names
    assert "Transport" in names
    assert "Salary" in names


def test_filter_categories_by_type(client):
    # AC: Category management with income / expense / both types
    response = client.get("/api/v1/categories?type=income")
    assert response.status_code == 200
    data = response.json()
    for cat in data:
        assert cat["type"] in ["income", "both"]


def test_create_custom_category(client):
    # AC: Users can create custom categories to organize transactions (e.g., Freelance Work)
    payload = {
        "name": "Freelance Work",
        "type": "income",
        "is_predefined": False,
    }
    response = client.post("/api/v1/categories", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Freelance Work"
    assert data["type"] == "income"
    assert data["is_predefined"] is False
    assert "id" in data


def test_get_category_by_id(client):
    # Create custom category
    payload = {
        "name": "Side Hustle",
        "type": "income",
    }
    res = client.post("/api/v1/categories", json=payload)
    cat_id = res.json()["id"]

    get_res = client.get(f"/api/v1/categories/{cat_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Side Hustle"

    # Nonexistent
    get_non = client.get("/api/v1/categories/nonexistent-id-999")
    assert get_non.status_code == 404


def test_delete_custom_category(client):
    payload = {
        "name": "Temporary",
        "type": "expense",
    }
    res = client.post("/api/v1/categories", json=payload)
    cat_id = res.json()["id"]

    del_res = client.delete(f"/api/v1/categories/{cat_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/v1/categories/{cat_id}")
    assert get_res.status_code == 404


def test_delete_predefined_category_returns_400(client):
    res = client.get("/api/v1/categories")
    food_cat = next(c for c in res.json() if c["name"] == "Food")
    del_res = client.delete(f"/api/v1/categories/{food_cat['id']}")
    assert del_res.status_code == 400
    assert "Predefined categories cannot be deleted" in del_res.json()["detail"]


def test_create_duplicate_category_returns_400(client):
    # AC: Error handling for duplicate category creation
    payload = {
        "name": "Food",
        "type": "expense",
    }
    response = client.post("/api/v1/categories", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_create_category_validation_error(client):
    # AC: Input validation for category creation
    payload = {
        "name": "",
        "type": "invalid_type",
    }
    response = client.post("/api/v1/categories", json=payload)
    assert response.status_code == 422
