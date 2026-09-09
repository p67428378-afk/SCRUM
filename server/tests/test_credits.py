from fastapi.testclient import TestClient


def test_list_credits_default(client: TestClient):
    response = client.get("/api/v1/credits")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "credits" in data
    assert isinstance(data["credits"], list)
    assert data["total"] > 0


def test_list_credits_filter_category(client: TestClient):
    response = client.get("/api/v1/credits?category=television")
    assert response.status_code == 200
    data = response.json()
    assert "credits" in data
    for credit in data["credits"]:
        assert credit["category"].lower() == "television"


def test_list_credits_pagination(client: TestClient):
    response = client.get("/api/v1/credits?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["credits"]) <= 2
