def test_get_dashboard_summary(client, auth_headers):
    response = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "active_crop_cycles" in data
    assert "livestock_headcount" in data
    assert "equipment_operating" in data
    assert "low_inventory_count" in data
    assert "alerts" in data
    assert isinstance(data["alerts"], list)
