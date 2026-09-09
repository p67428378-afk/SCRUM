def test_register_citizen(client):
    payload = {
        "full_name": "John Smith",
        "email": "john.smith@example.com",
        "phone": "555-0188",
        "address": "789 Oak Ave",
    }
    response = client.post("/api/v1/citizens", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "John Smith"
    assert data["email"] == "john.smith@example.com"
    assert "id" in data


def test_register_duplicate_citizen_email(client):
    payload = {
        "full_name": "Jane Doe Duplicate",
        "email": "jane.doe@city.gov",
        "phone": "555-0192",
    }
    response = client.post("/api/v1/citizens", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_list_citizens(client):
    response = client.get("/api/v1/citizens")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    emails = [c["email"] for m in [data] for c in m]
    assert "jane.doe@city.gov" in emails


def test_get_citizen_by_id(client):
    citizens = client.get("/api/v1/citizens").json()
    citizen_id = citizens[0]["id"]

    response = client.get(f"/api/v1/citizens/{citizen_id}")
    assert response.status_code == 200
    assert response.json()["id"] == citizen_id


def test_get_nonexistent_citizen(client):
    response = client.get("/api/v1/citizens/nonexistent-id")
    assert response.status_code == 404
