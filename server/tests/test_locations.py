"""
Module: test_locations
Purpose: Unit tests for location management endpoints.
Author: Backend Developer Agent
Created: 2026-06-19
"""

def test_create_location_success(client):
    # AC: Location Management: Input city or zip code, retrieve and display weather.
    payload = {
        "name": "Paris",
        "country": "FR",
        "is_default": True
    }
    response = client.post("/api/v1/locations", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Paris"
    assert data["country"] == "FR"
    assert data["is_default"] is True
    assert "id" in data

def test_create_location_duplicate(client):
    # AC: Location Management: Provide suggestions or handle duplicate/invalid locations gracefully.
    payload = {
        "name": "Paris",
        "country": "FR",
        "is_default": False
    }
    # First creation
    client.post("/api/v1/locations", json=payload)
    # Second creation (duplicate)
    response = client.post("/api/v1/locations", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Location already saved"

def test_get_locations(client):
    # AC: Location Management: Get list of saved locations for the user.
    client.post("/api/v1/locations", json={"name": "New York", "country": "US"})
    client.post("/api/v1/locations", json={"name": "Tokyo", "country": "JP"})
    
    response = client.get("/api/v1/locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    names = [loc["name"] for loc in data]
    assert "New York" in names
    assert "Tokyo" in names

def test_set_default_location(client):
    # AC: Location Management: Set a saved location as default.
    res1 = client.post("/api/v1/locations", json={"name": "Berlin", "country": "DE", "is_default": False})
    loc_id = res1.json()["id"]
    
    response = client.put(f"/api/v1/locations/{loc_id}/default")
    assert response.status_code == 200
    data = response.json()
    assert data["is_default"] is True
    assert data["name"] == "Berlin"

def test_delete_location(client):
    # AC: Location Management: Delete a saved location.
    res1 = client.post("/api/v1/locations", json={"name": "Rome", "country": "IT"})
    loc_id = res1.json()["id"]
    
    response = client.delete(f"/api/v1/locations/{loc_id}")
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify it's deleted
    get_res = client.get("/api/v1/locations")
    names = [loc["name"] for loc in get_res.json()]
    assert "Rome" not in names
