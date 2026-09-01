def test_create_patient(client):
    payload = {
        "full_name": "John Doe",
        "date_of_birth": "1985-06-15",
        "gender": "Male",
        "contact_number": "+1-555-0199",
        "email": "john.doe@example.com",
        "address": "123 Health Ave",
        "emergency_contact": {"name": "Jane Doe", "phone": "+1-555-0200"},
        "insurance_info": {"provider": "HealthShield", "policy_number": "INS-99882"},
        "ssn": "123-45-6789",
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "John Doe"
    assert data["patient_code"].startswith("PAT-")
    assert data["ssn_masked"] == "XXX-XX-6789"


def test_search_patients(client):
    response = client.get("/api/v1/patients/search?query=John")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_get_patient_by_id(client):
    payload = {
        "full_name": "Alice Smith",
        "date_of_birth": "1990-01-01",
        "gender": "Female",
        "contact_number": "+1-555-0300",
    }
    create_res = client.post("/api/v1/patients", json=payload)
    p_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/patients/{p_id}")
    assert get_res.status_code == 200
    assert get_res.json()["full_name"] == "Alice Smith"


def test_update_medical_history(client):
    payload = {
        "full_name": "Bob Marley",
        "date_of_birth": "1980-05-05",
        "gender": "Male",
        "contact_number": "+1-555-0400",
    }
    create_res = client.post("/api/v1/patients", json=payload)
    p_id = create_res.json()["id"]

    med_payload = {
        "allergies": ["Penicillin - Severe"],
        "chronic_conditions": ["Hypertension"],
        "current_medications": ["Lisinopril 10mg"],
        "visit_notes": "Routine checkup.",
    }
    update_res = client.put(
        f"/api/v1/patients/{p_id}/medical-history", json=med_payload
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert "Penicillin - Severe" in data["medical_record"]["allergies"]
