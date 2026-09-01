def test_list_patients(client):
    """Test retrieving paginated list of patients."""
    response = client.get("/api/v1/patients?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["full_name"] == "Jane Doe"


def test_create_patient(client):
    """Test successfully creating a new patient profile."""
    payload = {
        "full_name": "Alice Wonderland",
        "dob": "1988-03-22",
        "gender": "Female",
        "phone": "+1-555-0144",
        "email": "alice@example.com",
        "emergency_contact": "Bob Wonderland (+1-555-0145)",
        "insurance_provider": "BlueCross",
        "insurance_policy_number": "BC-123456",
        "ssn": "111-22-3333",
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Alice Wonderland"
    assert data["dob"] == "1988-03-22"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_patient_duplicate_ssn(client):
    """Test duplicate SSN detection returns 400."""
    payload = {
        "full_name": "Charlie Brown",
        "dob": "1995-10-10",
        "gender": "Male",
        "phone": "+1-555-0899",
        "emergency_contact": "Sally Brown (+1-555-0898)",
        "ssn": "999-00-1234",  # Duplicate of seeded Jane Doe
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_create_patient_validation_error(client):
    """Test creating patient with missing mandatory fields returns 422."""
    payload = {"full_name": "Incomplete Patient"}
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 422


def test_get_patient_by_id(client):
    """Test getting patient details by valid ID."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    response = client.get(f"/api/v1/patients/{patient_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == patient_id
    assert data["full_name"] == "Jane Doe"


def test_get_nonexistent_patient(client):
    """Test retrieving non-existent patient returns 404."""
    response = client.get("/api/v1/patients/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_search_patients(client):
    """Test searching patients by query string."""
    response = client.get("/api/v1/patients/search?q=Jane")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(p["full_name"] == "Jane Doe" for p in data)


def test_update_patient(client):
    """Test updating patient demographic and contact fields."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    update_payload = {"phone": "+1-555-9999", "insurance_provider": "UnitedHealthcare"}
    response = client.put(f"/api/v1/patients/{patient_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["phone"] == "+1-555-9999"
    assert data["insurance_provider"] == "UnitedHealthcare"
