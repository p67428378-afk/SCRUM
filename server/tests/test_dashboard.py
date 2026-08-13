def test_get_dashboard_metrics(client, staff_auth_headers):
    response = client.get("/api/v1/dashboard/metrics", headers=staff_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "occupancy_rate" in data
    assert "total_rooms" in data
    assert "occupied_rooms" in data
    assert "available_rooms" in data
    assert "cleaning_rooms" in data
    assert "daily_revenue" in data
