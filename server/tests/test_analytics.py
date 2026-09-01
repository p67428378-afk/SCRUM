def test_cma_analytics_with_data(client):
    response = client.get("/api/v1/analytics/cma?zip_code=78701")
    assert response.status_code == 200
    data = response.json()
    assert data["location"] == "78701"
    assert data["insufficient_data"] is False
    assert data["median_price_per_sqft"] > 0
    assert data["average_days_on_market"] >= 0
    assert isinstance(data["price_trend_points"], list)
    assert len(data["price_trend_points"]) > 0
    point = data["price_trend_points"][0]
    assert "month" in point
    assert "avg_price_per_sqft" in point


test_cma_analytics_by_city = None  # placeholder name avoid conflict


def test_cma_analytics_by_city_query(client):
    response = client.get("/api/v1/analytics/cma?city=Austin")
    assert response.status_code == 200
    data = response.json()
    assert data["location"] == "Austin"
    assert data["insufficient_data"] is False
    assert data["median_price_per_sqft"] > 0


def test_cma_analytics_insufficient_data(client):
    response = client.get("/api/v1/analytics/cma?zip_code=00000")
    assert response.status_code == 200
    data = response.json()
    assert data["location"] == "00000"
    assert data["insufficient_data"] is True
    assert data["median_price_per_sqft"] == 0.0
    assert data["average_days_on_market"] == 0.0
    assert data["price_trend_points"] == []


def test_list_and_filter_properties(client):
    response = client.get("/api/v1/properties?city=Austin")
    assert response.status_code == 200
    props = response.json()
    assert isinstance(props, list)
    assert len(props) >= 1
