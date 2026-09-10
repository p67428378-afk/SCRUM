def test_get_kpi_metrics_success(client):
    response = client.get("/api/v1/metrics/kpi")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_name"] == "Small Town Value Cluster"
    assert data["category"] == "Snacks"
    assert "sales_per_linear_ft" in data
    assert "private_brand_percentage" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity_utilization" in data
    assert data["sales_per_linear_ft"] >= 1000.0
    assert data["in_stock_rate"] >= 95.0
    assert data["private_brand_percentage"] >= 25.0


def test_get_kpi_metrics_with_query_params(client):
    response = client.get("/api/v1/metrics/kpi?cluster_name=Small Town Value Cluster&category=Snacks")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_name"] == "Small Town Value Cluster"
    assert data["category"] == "Snacks"
