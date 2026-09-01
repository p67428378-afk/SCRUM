def test_list_doctors(client):
    """Test retrieving list of doctors."""
    response = client.get("/api/v1/doctors")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    assert any(d["specialty"] == "Cardiology" for d in data)


def test_create_doctor(client):
    """Test registering a new doctor."""
    payload = {
        "full_name": "Dr. Gregory House",
        "specialty": "Diagnostic Medicine",
        "email": "house@princeton.org",
    }
    response = client.post("/api/v1/doctors", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Dr. Gregory House"
    assert data["specialty"] == "Diagnostic Medicine"
    assert "id" in data


def test_create_doctor_duplicate_email(client):
    """Test creating a doctor with existing email returns 400."""
    payload = {
        "full_name": "Dr. Sarah Duplicate",
        "specialty": "Cardiology",
        "email": "sarah.jenkins@hospital.org",
    }
    response = client.post("/api/v1/doctors", json=payload)
    assert response.status_code == 400


def test_get_doctor_by_id(client):
    """Test retrieving doctor by valid ID."""
    doc_id = "11111111-1111-4111-8111-111111111111"
    response = client.get(f"/api/v1/doctors/{doc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc_id
    assert data["full_name"] == "Dr. Sarah Jenkins"


def test_health_check(client):
    """Test health check endpoints."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "database": "connected"}

    response2 = client.get("/health")
    assert response2.status_code == 200
    assert response2.json() == {"status": "healthy", "database": "connected"}
