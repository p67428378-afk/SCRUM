def test_get_countries(client):
    response = client.get("/api/v1/countries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5


def test_search_countries_by_name(client):
    response = client.get("/api/v1/countries?search=Germany")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Germany" in data[0]["name"]


def test_search_countries_by_code(client):
    response = client.get("/api/v1/countries?search=JP")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Japan" in data[0]["name"]


def test_filter_countries_by_continent(client):
    response = client.get("/api/v1/countries?continent=Europe")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    for country in data:
        assert "Europe" in country["continent_name"]


def test_filter_countries_by_status(client):
    response = client.get("/api/v1/countries?status=Active")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for country in data:
        assert country["portfolio_status"] == "Active"


def test_get_country_detail_by_id(client):
    response = client.get("/api/v1/countries?search=Germany")
    germany = response.json()[0]
    germany_id = germany["id"]

    detail_res = client.get(f"/api/v1/countries/{germany_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == germany_id
    assert "Germany" in detail_data["name"]
    assert len(detail_data["investments"]) >= 2


def test_get_country_detail_by_code(client):
    detail_res = client.get("/api/v1/countries/FR")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert "France" in detail_data["name"]


def test_get_country_not_found(client):
    response = client.get("/api/v1/countries/NONEXISTENT999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Country not found"


def test_add_investment(client):
    get_res = client.get("/api/v1/countries?search=Kenya")
    kenya = get_res.json()[0]
    kenya_id = kenya["id"]

    initial_detail = client.get(f"/api/v1/countries/{kenya_id}").json()
    initial_count = len(initial_detail["investments"])
    initial_total = initial_detail["total_investment_usd"]

    inv_payload = {
        "asset_name": "Mombasa Port Logistics",
        "sector": "Infrastructure",
        "amount_usd": 15000000.0,
        "status": "Performing",
        "date_added": "2024-07-01",
    }
    response = client.post(
        f"/api/v1/countries/{kenya_id}/investments", json=inv_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert data["asset_name"] == "Mombasa Port Logistics"
    assert data["amount_usd"] == 15000000.0

    # Verify total investment updated
    updated_detail = client.get(f"/api/v1/countries/{kenya_id}").json()
    assert len(updated_detail["investments"]) == initial_count + 1
    assert updated_detail["total_investment_usd"] == initial_total + 15000000.0
