import pytest
from fastapi.testclient import TestClient
from server.core.cache import clear_cache


@pytest.fixture(autouse=True)
def reset_cache():
    clear_cache()
    yield
    clear_cache()


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_get_all_regions(client: TestClient):
    response = client.get("/api/v1/regions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 36  # 28 States + 8 Union Territories

    # Verify schema fields for first item
    first = data[0]
    assert "id" in first
    assert "name" in first
    assert "capital" in first
    assert "type" in first
    assert "region" in first
    assert "population" in first
    assert "official_languages" in first
    assert "created_at" in first
    assert "updated_at" in first


def test_filter_by_type_state(client: TestClient):
    response = client.get("/api/v1/regions?type=state")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 28
    assert all(item["type"] == "state" for item in data)


def test_filter_by_type_union_territory(client: TestClient):
    response = client.get("/api/v1/regions?type=union_territory")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    assert all(item["type"] == "union_territory" for item in data)


def test_search_by_state_name(client: TestClient):
    response = client.get("/api/v1/regions?q=Rajasthan")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Rajasthan"
    assert data[0]["capital"] == "Jaipur"


def test_search_by_capital_name(client: TestClient):
    response = client.get("/api/v1/regions?q=Jaipur")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Rajasthan"
    assert data[0]["capital"] == "Jaipur"


def test_search_case_insensitive(client: TestClient):
    response = client.get("/api/v1/regions?q=mumbai")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Maharashtra"
    assert data[0]["capital"] == "Mumbai"


def test_filter_type_and_search_combined(client: TestClient):
    response = client.get("/api/v1/regions?type=state&q=Jaipur")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Rajasthan"

    # Search capital that belongs to a UT with type=state should return 0 results
    response_ut_mismatch = client.get("/api/v1/regions?type=state&q=Daman")
    assert response_ut_mismatch.status_code == 200
    assert len(response_ut_mismatch.json()) == 0


def test_invalid_type_returns_400(client: TestClient):
    response = client.get("/api/v1/regions?type=invalid_type")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid 'type' filter parameter" in data["detail"]


def test_empty_search_results(client: TestClient):
    response = client.get("/api/v1/regions?q=NonExistentCity")
    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_caching_behavior(client: TestClient):
    # First call primes cache
    res1 = client.get("/api/v1/regions?type=union_territory")
    assert res1.status_code == 200

    # Second call fetches from cache
    res2 = client.get("/api/v1/regions?type=union_territory")
    assert res2.status_code == 200
    assert res1.json() == res2.json()
