def test_get_analytics_summary(client):
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_tonnage" in data
    assert "route_completion_pct" in data
    assert "sla_compliance_pct" in data


def test_get_heatmaps(client):
    response = client.get("/api/v1/analytics/heatmaps")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
