def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_continents(client):
    response = client.get("/api/v1/continents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5

    names = [c["name"] for c in data]
    assert any("Europe" in n for n in names)
    assert any("Asia" in n for n in names)

    europe = next(c for c in data if "Europe" in c["name"])
    assert europe["country_count"] >= 2
    assert europe["total_portfolio_assets_usd"] > 0


def test_get_continent_by_id(client):
    response = client.get("/api/v1/continents")
    data = response.json()
    europe_id = next(c["id"] for c in data if "Europe" in c["name"])

    detail_res = client.get(f"/api/v1/continents/{europe_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == europe_id
    assert "Europe" in detail_data["name"]


def test_get_continent_not_found(client):
    response = client.get("/api/v1/continents/non-existent-uuid")
    assert response.status_code == 404
    assert response.json()["detail"] == "Continent not found"


def test_create_continent(client):
    payload = {"name": "Antarctica", "code": "AN"}
    response = client.post("/api/v1/continents", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Antarctica"
    assert data["code"] == "AN"
    assert data["country_count"] == 0
