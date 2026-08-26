def get_first_category_id(client, name="Food"):
    res = client.get("/api/v1/categories")
    for cat in res.json():
        if cat["name"] == name:
            return cat["id"]
    return res.json()[0]["id"]


def test_add_expense_transaction(client):
    # AC: Users can add income and expense entries with details such as amount, date, description, category, and payment method.
    # Example: A user enters an expense of $45.50 for "Grocery Shopping" on 2026-05-18 under "Food" category using "Credit Card"
    category_id = get_first_category_id(client, "Food")
    payload = {
        "amount": 45.50,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Grocery Shopping",
        "category_id": category_id,
        "payment_method": "Credit Card",
    }
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 45.50
    assert data["type"] == "expense"
    assert data["date"] == "2026-05-18"
    assert data["description"] == "Grocery Shopping"
    assert data["category_id"] == category_id
    assert data["payment_method"] == "Credit Card"
    assert "id" in data


def test_add_income_transaction(client):
    # AC: Users can add income entries
    category_id = get_first_category_id(client, "Salary")
    payload = {
        "amount": 5000.00,
        "type": "income",
        "date": "2026-05-01",
        "description": "Monthly Salary",
        "category_id": category_id,
        "payment_method": "Bank Transfer",
    }
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 5000.00
    assert data["type"] == "income"


def test_add_transaction_with_incompatible_category_returns_400(client):
    # Food is an expense category, trying to use it as income should fail with 400
    food_id = get_first_category_id(client, "Food")
    payload = {
        "amount": 100.00,
        "type": "income",
        "date": "2026-05-18",
        "description": "Incompatible transaction",
        "category_id": food_id,
    }
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 400
    assert "incompatible" in response.json()["detail"].lower()


def test_add_transaction_with_nonexistent_category_returns_404(client):
    # AC: Error handling for invalid category reference
    payload = {
        "amount": 25.00,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Coffee",
        "category_id": "non-existent-uuid-1234",
        "payment_method": "Cash",
    }
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 404


def test_add_transaction_negative_amount_validation(client):
    # AC: Expenses must have positive amounts; negative amounts rejected
    category_id = get_first_category_id(client, "Food")
    payload = {
        "amount": -50.00,
        "type": "expense",
        "date": "2026-05-18",
        "description": "Invalid Expense",
        "category_id": category_id,
    }
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 422


def test_get_and_update_and_delete_transaction(client):
    # AC: Users can edit and delete transactions
    category_id = get_first_category_id(client, "Transport")
    payload = {
        "amount": 15.00,
        "type": "expense",
        "date": "2026-05-10",
        "description": "Bus ticket",
        "category_id": category_id,
        "payment_method": "Cash",
    }
    create_res = client.post("/api/v1/expenses", json=payload)
    assert create_res.status_code == 201
    tx_id = create_res.json()["id"]

    # Retrieve
    get_res = client.get(f"/api/v1/expenses/{tx_id}")
    assert get_res.status_code == 200
    assert get_res.json()["description"] == "Bus ticket"

    # Update
    update_payload = {
        "amount": 18.50,
        "description": "Express bus ticket",
    }
    put_res = client.put(f"/api/v1/expenses/{tx_id}", json=update_payload)
    assert put_res.status_code == 200
    assert put_res.json()["amount"] == 18.50
    assert put_res.json()["description"] == "Express bus ticket"

    # Update with incompatible category returns 400
    salary_id = get_first_category_id(client, "Salary")
    bad_update = client.put(
        f"/api/v1/expenses/{tx_id}", json={"category_id": salary_id}
    )
    assert bad_update.status_code == 400

    # Delete
    del_res = client.delete(f"/api/v1/expenses/{tx_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_after_del = client.get(f"/api/v1/expenses/{tx_id}")
    assert get_after_del.status_code == 404


def test_filtering_and_search_transactions(client):
    # AC: Users can search transactions by keyword or filter entries by category, date range, or transaction type
    food_id = get_first_category_id(client, "Food")
    salary_id = get_first_category_id(client, "Salary")

    # Create test transactions
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 30.0,
            "type": "expense",
            "date": "2026-05-05",
            "description": "Supermarket Dinner",
            "category_id": food_id,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 50.0,
            "type": "expense",
            "date": "2026-05-15",
            "description": "Restaurant Lunch",
            "category_id": food_id,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 4000.0,
            "type": "income",
            "date": "2026-05-01",
            "description": "Monthly Salary",
            "category_id": salary_id,
        },
    )

    # Search keyword
    res_search = client.get("/api/v1/expenses?search=Lunch")
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert "Restaurant Lunch" in res_search.json()[0]["description"]

    # Filter by category
    res_cat = client.get(f"/api/v1/expenses?category_id={food_id}")
    assert res_cat.status_code == 200
    assert len(res_cat.json()) == 2

    # Filter by type
    res_type = client.get("/api/v1/expenses?type=income")
    assert res_type.status_code == 200
    assert len(res_type.json()) == 1
    assert res_type.json()[0]["type"] == "income"

    # Filter by date range
    res_date = client.get("/api/v1/expenses?start_date=2026-05-10&end_date=2026-05-20")
    assert res_date.status_code == 200
    assert len(res_date.json()) == 1
    assert res_date.json()[0]["description"] == "Restaurant Lunch"
