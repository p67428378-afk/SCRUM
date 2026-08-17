def test_get_concerts_no_filters(client):
    # AC: International Concert Schedule & Multi-Country Filtering (Full-Stack): Interactive tour schedule filterable by country, city, date range, venue status.
    response = client.get("/api/v1/concerts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 4
    assert len(data["items"]) >= 4


def test_get_concerts_filter_by_country(client):
    # AC: International Concert Schedule & Multi-Country Filtering (Full-Stack): Interactive tour schedule filterable by country, city, date range, venue status.
    response = client.get("/api/v1/concerts?country=Germany")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["country"] == "Germany"
    assert data["items"][0]["city"] == "Berlin"


def test_get_concerts_filter_by_city(client):
    # AC: International Concert Schedule & Multi-Country Filtering (Full-Stack): Interactive tour schedule filterable by country, city, date range, venue status.
    response = client.get("/api/v1/concerts?city=London")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["city"] == "London"


def test_get_concert_by_id_success(client):
    # AC: International Concert Schedule & Multi-Country Filtering (Full-Stack): Interactive tour schedule filterable by country, city, date range, venue status.
    # First get all concerts to find a valid ID
    response = client.get("/api/v1/concerts")
    concert_id = response.json()["items"][0]["id"]

    response = client.get(f"/api/v1/concerts/{concert_id}")
    assert response.status_code == 200
    data = response.json()
    assert "tour_name" in data
    assert len(data["ticket_tiers"]) > 0


def test_get_concert_by_id_not_found(client):
    # AC: International Concert Schedule & Multi-Country Filtering (Full-Stack): Interactive tour schedule filterable by country, city, date range, venue status.
    response = client.get("/api/v1/concerts/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.json()["detail"] == "Concert not found"
