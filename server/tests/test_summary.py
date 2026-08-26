def test_empty_summary(client):
    response = client.get("/api/v1/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 0.0
    assert data["total_expense"] == 0.0
    assert data["net_balance"] == 0.0
    assert data["category_breakdown"] == []


def test_financial_dashboard_summary_and_breakdown(client):
    # Create categories
    inc_cat = client.post(
        "/api/v1/categories", json={"name": "Salary", "type": "income"}
    ).json()["id"]
    rent_cat = client.post(
        "/api/v1/categories", json={"name": "Rent", "type": "expense"}
    ).json()["id"]
    food_cat = client.post(
        "/api/v1/categories", json={"name": "Food", "type": "expense"}
    ).json()["id"]

    # Seed transactions for May 2026
    # Income: $5,000
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 5000.00,
            "type": "income",
            "date": "2026-05-01",
            "description": "Monthly Salary",
            "category_id": inc_cat,
        },
    )
    # Rent: $1,400
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 1400.00,
            "type": "expense",
            "date": "2026-05-02",
            "description": "Apartment Rent",
            "category_id": rent_cat,
        },
    )
    # Food: $700
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 700.00,
            "type": "expense",
            "date": "2026-05-05",
            "description": "Groceries & Dining",
            "category_id": food_cat,
        },
    )

    response = client.get("/api/v1/summary?start_date=2026-05-01&end_date=2026-05-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 5000.00
    assert data["total_expense"] == 2100.00
    assert data["net_balance"] == 2900.00

    breakdown = data["category_breakdown"]
    assert len(breakdown) == 2

    rent_item = next(item for item in breakdown if item["category_id"] == rent_cat)
    assert rent_item["category_name"] == "Rent"
    assert rent_item["amount"] == 1400.00
    assert round(rent_item["percentage"], 1) == round((1400.00 / 2100.00) * 100, 1)

    food_item = next(item for item in breakdown if item["category_id"] == food_cat)
    assert food_item["category_name"] == "Food"
    assert food_item["amount"] == 700.00
    assert round(food_item["percentage"], 1) == round((700.00 / 2100.00) * 100, 1)


def test_summary_date_filtering(client):
    food_cat = client.post(
        "/api/v1/categories", json={"name": "Food", "type": "expense"}
    ).json()["id"]

    client.post(
        "/api/v1/expenses",
        json={
            "amount": 100.00,
            "type": "expense",
            "date": "2026-04-15",
            "description": "April Expense",
            "category_id": food_cat,
        },
    )
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 200.00,
            "type": "expense",
            "date": "2026-05-15",
            "description": "May Expense",
            "category_id": food_cat,
        },
    )

    response = client.get("/api/v1/summary?start_date=2026-05-01&end_date=2026-05-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_expense"] == 200.00
    assert data["net_balance"] == -200.00
