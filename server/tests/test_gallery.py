from fastapi.testclient import TestClient


def test_list_gallery_default(client: TestClient):
    response = client.get("/api/v1/gallery")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "assets" in data
    assert isinstance(data["assets"], list)
    assert data["total"] > 0


def test_list_gallery_filter_media_type(client: TestClient):
    response = client.get("/api/v1/gallery?media_type=headshot")
    assert response.status_code == 200
    data = response.json()
    assert "assets" in data
    for asset in data["assets"]:
        assert asset["media_type"].lower() == "headshot"
