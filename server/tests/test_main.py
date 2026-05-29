
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_get_cars_availability():
    response = client.get("/api/v1/cars/availability")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
