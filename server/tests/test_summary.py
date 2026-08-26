def get_first_category_id(client, name="Food"):
    res = client.get("/api/v1/categories")
    for cat in res.json():
        if cat["name"] == name:
            return cat["id"]
    return res.json()[0]["id"]


def test_empty_summary(client):
    # AC: Smooth handling of empty transaction lists
    response = client.get("/api/v1/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 0.0
    assert data["total_expense"] == 0.0
    assert data["net_balance"] == 0.0
    assert data["category_breakdown"] == []


def test_financial_dashboard_summary_and_breakdown(client):
    # AC: Financial Dashboard & Summaries: Users can view total balance, total income, total expenses, and a visual breakdown of spending by category
    # Example: Total income $5,000, total expenses $2,100, net balance $2,900, and breakdown percentages
    salary_id = get_first_category_id(client, "Salary")
    food_id = get_first_category_id(client, "Food")
    housing_id = get_first_category_id(client, "Housing")

    # Income: $5000
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 5000.00,
            "type": "income",
            "date": "2026-05-01",
            "description": "Salary",
            "category_id": salary_id,
        },
    )

    # Expense 1: Housing $1400
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 1400.00,
            "type": "expense",
            "date": "2026-05-02",
            "description": "Rent",
            "category_id": housing_id,
        },
    )

    # Expense 2: Food $700
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 700.00,
            "type": "expense",
            "date": "2026-05-05",
            "description": "Groceries",
            "category_id": food_id,
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
    # Housing should be first (largest expense)
    assert breakdown[0]["category_name"] == "Housing"
    assert breakdown[0]["amount"] == 1400.00
    assert round(breakdown[0]["percentage"], 1) == 66.7

    assert breakdown[1]["category_name"] == "Food"
    assert breakdown[1]["amount"] == 700.00
    assert round(breakdown[1]["percentage"], 1) == 33.3


def test_summary_period_filter(client):
    # AC: Summary across selected date ranges (daily, monthly, yearly)
    food_id = get_first_category_id(client, "Food")
    client.post(
        "/api/v1/expenses",
        json={
            "amount": 25.0,
            "type": "expense",
            "date": "2026-01-15",
            "description": "Past expense",
            "category_id": food_id,
        },
    )

    response = client.get("/api/v1/summary?period=yearly")
    assert response.status_code == 200
    data = response.json()
    assert "total_income" in data
    assert "total_expense" in data
    assert "net_balance" in data
