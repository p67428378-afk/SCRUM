def test_analytics_summary(client):
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "daily_revenue" in data
    assert "total_revenue" in data
    assert "instant_orders_count" in data
    assert "active_pre_orders_count" in data
    assert "low_stock_ingredients_count" in data
    assert isinstance(data["top_selling_items"], list)
