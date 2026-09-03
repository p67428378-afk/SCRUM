def test_get_dashboard_analytics(client):
    # Retrieve dashboard metrics
    res = client.get("/api/v1/dashboard")
    assert res.status_code == 200
    data = res.json()

    assert "today_revenue" in data
    assert "active_orders" in data
    assert "completed_orders" in data
    assert "total_orders" in data
    assert "occupied_tables" in data
    assert "total_tables" in data
    assert "top_items" in data

    assert isinstance(data["today_revenue"], (int, float))
    assert isinstance(data["active_orders"], int)
    assert isinstance(data["occupied_tables"], int)
    assert data["total_tables"] >= 8
