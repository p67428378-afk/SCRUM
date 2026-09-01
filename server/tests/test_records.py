def test_get_patient_records(client):
    """Test retrieving clinical records for a patient."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    response = client.get(f"/api/v1/records/patient/{patient_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "allergies" in data[0]
    assert "clinical_notes" in data[0]


def test_get_records_nonexistent_patient(client):
    """Test retrieving records for a non-existent patient returns 404."""
    response = client.get(
        "/api/v1/records/patient/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


def test_create_medical_record(client):
    """Test appending a new medical record/clinical note."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    doctor_id = "11111111-1111-4111-8111-111111111111"
    payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "allergies": "Sulfa drugs",
        "current_medications": "Amoxicillin 500mg",
        "clinical_notes": "Follow-up visit. Patient symptoms improving.",
    }
    response = client.post("/api/v1/records", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["patient_id"] == patient_id
    assert data["allergies"] == "Sulfa drugs"
    assert data["clinical_notes"] == "Follow-up visit. Patient symptoms improving."
    assert "id" in data


def test_create_medical_record_invalid_patient(client):
    """Test creating record for non-existent patient returns 404."""
    payload = {
        "patient_id": "00000000-0000-0000-0000-000000000000",
        "clinical_notes": "Note with invalid patient",
    }
    response = client.post("/api/v1/records", json=payload)
    assert response.status_code == 404
