def test_get_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_custom_category(client):
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
    assert "created_at" in data


def test_create_duplicate_category_fails(client):
    payload = {
        "name": "Subscriptions",
        "type": "expense",
        "is_predefined": False,
    }
    res1 = client.post("/api/v1/categories", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/categories", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()


def test_filter_categories_by_type(client):
    client.post("/api/v1/categories", json={"name": "Salary Bonus", "type": "income"})
    client.post("/api/v1/categories", json={"name": "Groceries", "type": "expense"})
    client.post("/api/v1/categories", json={"name": "General", "type": "both"})

    income_res = client.get("/api/v1/categories?type=income")
    assert income_res.status_code == 200
    income_names = [c["name"] for c in income_res.json()]
    assert "Salary Bonus" in income_names
    assert "General" in income_names
    assert "Groceries" not in income_names

    expense_res = client.get("/api/v1/categories?type=expense")
    assert expense_res.status_code == 200
    expense_names = [c["name"] for c in expense_res.json()]
    assert "Groceries" in expense_names
    assert "General" in expense_names
    assert "Salary Bonus" not in expense_names
