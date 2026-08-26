def test_create_expense_transaction(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Food", "type": "expense"}
    )
    cat_id = cat_res.json()["id"]

    tx_payload = {
        "amount": 45.50,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Grocery Shopping",
        "category_id": cat_id,
        "payment_method": "Credit Card",
    }
    response = client.post("/api/v1/expenses", json=tx_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 45.50
    assert data["type"] == "expense"
    assert data["description"] == "Grocery Shopping"
    assert data["category_id"] == cat_id
    assert data["payment_method"] == "Credit Card"
    assert "id" in data


def test_create_income_transaction(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Salary", "type": "income"}
    )
    cat_id = cat_res.json()["id"]

    tx_payload = {
        "amount": 5000.00,
        "type": "income",
        "date": "2026-05-01",
        "description": "Monthly Salary",
        "category_id": cat_id,
        "payment_method": "Bank Transfer",
    }
    response = client.post("/api/v1/expenses", json=tx_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 5000.00
    assert data["type"] == "income"
    assert data["description"] == "Monthly Salary"


def test_create_transaction_invalid_category(client):
    tx_payload = {
        "amount": 100.00,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Invalid Category Test",
        "category_id": "00000000-0000-0000-0000-000000000000",
    }
    response = client.post("/api/v1/expenses", json=tx_payload)
    assert response.status_code == 400


def test_create_transaction_invalid_amount(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Misc", "type": "expense"}
    )
    cat_id = cat_res.json()["id"]

    tx_payload = {
        "amount": -50.00,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Negative Amount Test",
        "category_id": cat_id,
    }
    response = client.post("/api/v1/expenses", json=tx_payload)
    assert response.status_code == 422


def test_get_transaction_by_id(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Transport", "type": "expense"}
    )
    cat_id = cat_res.json()["id"]

    create_res = client.post(
        "/api/v1/expenses",
        json={
            "amount": 25.00,
            "type": "expense",
            "date": "2026-05-10",
            "description": "Bus Pass",
            "category_id": cat_id,
        },
    )
    tx_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/expenses/{tx_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == tx_id
    assert get_res.json()["description"] == "Bus Pass"

    not_found_res = client.get("/api/v1/expenses/non-existent-id")
    assert not_found_res.status_code == 404


def test_update_transaction(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Utilities", "type": "expense"}
    )
    cat_id = cat_res.json()["id"]

    create_res = client.post(
        "/api/v1/expenses",
        json={
            "amount": 80.00,
            "type": "expense",
            "date": "2026-05-05",
            "description": "Electric Bill",
            "category_id": cat_id,
        },
    )
    tx_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/expenses/{tx_id}",
        json={"amount": 95.50, "description": "Electric Bill - Revised"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["amount"] == 95.50
    assert update_res.json()["description"] == "Electric Bill - Revised"


def test_delete_transaction(client):
    cat_res = client.post(
        "/api/v1/categories", json={"name": "Entertainment", "type": "expense"}
    )
    cat_id = cat_res.json()["id"]

    create_res = client.post(
        "/api/v1/expenses",
        json={
            "amount": 15.00,
            "type": "expense",
            "date": "2026-05-12",
            "description": "Movie Ticket",
            "category_id": cat_id,
        },
    )
    tx_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/expenses/{tx_id}")
    assert del_res.status_code == 204

    get_after_del = client.get(f"/api/v1/expenses/{tx_id}")
    assert get_after_del.status_code == 404


def test_filtering_and_search_transactions(client):
    food_cat = client.post(
        "/api/v1/categories", json={"name": "Food", "type": "expense"}
    ).json()["id"]
    work_cat = client.post(
        "/api/v1/categories", json={"name": "Salary", "type": "income"}
    ).json()["id"]

    # Seed 3 transactions
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 30.00,
            "type": "expense",
            "date": "2026-05-02",
            "description": "Supermarket apples",
            "category_id": food_cat,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 45.00,
            "type": "expense",
            "date": "2026-05-15",
            "description": "Restaurant dinner",
            "category_id": food_cat,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 3000.00,
            "type": "income",
            "date": "2026-05-01",
            "description": "Paycheck",
            "category_id": work_cat,
        },
    )

    # 1. Total count
    all_res = client.get("/api/v1/expenses")
    assert all_res.status_code == 200
    assert len(all_res.json()) == 3

    # 2. Search by keyword
    search_res = client.get("/api/v1/expenses?search=apples")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["description"] == "Supermarket apples"

    # 3. Filter by category
    cat_filter_res = client.get(f"/api/v1/expenses?category_id={food_cat}")
    assert cat_filter_res.status_code == 200
    assert len(cat_filter_res.json()) == 2

    # 4. Filter by type
    income_filter_res = client.get("/api/v1/expenses?type=income")
    assert income_filter_res.status_code == 200
    assert len(income_filter_res.json()) == 1

    # 5. Filter by date range
    date_filter_res = client.get(
        "/api/v1/expenses?start_date=2026-05-10&end_date=2026-05-20"
    )
    assert date_filter_res.status_code == 200
    assert len(date_filter_res.json()) == 1
    assert date_filter_res.json()[0]["description"] == "Restaurant dinner"
