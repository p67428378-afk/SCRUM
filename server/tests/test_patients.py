def test_patient_registration_and_duplicate_warning(client, doctor_headers):
    patient_payload = {
        "full_name": "Alice Smith",
        "date_of_birth": "1990-05-20",
        "gender": "Female",
        "contact_number": "+1-555-0300",
        "email": "alice.smith@example.com",
        "address": "456 Oak Street",
        "emergency_contact": {"name": "Bob Smith", "phone": "+1-555-0301"},
        "insurance_info": {"provider": "CareMed", "policy_number": "INS-112233"},
        "ssn": "XXX-XX-9999",
    }

    # 1. Register Alice Smith
    res = client.post("/api/v1/patients", json=patient_payload, headers=doctor_headers)
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["patient_code"].startswith("PAT-")
    assert data["full_name"] == "Alice Smith"

    # 2. Duplicate registration without override -> 409 Conflict
    res_dup = client.post(
        "/api/v1/patients", json=patient_payload, headers=doctor_headers
    )
    assert res_dup.status_code == 409

    # 3. Duplicate registration WITH override_duplicate=True -> 201 Created
    res_override = client.post(
        "/api/v1/patients?override_duplicate=true",
        json=patient_payload,
        headers=doctor_headers,
    )
    assert res_override.status_code == 201


def test_patient_search_and_pagination(client, doctor_headers):
    # Search for seeded John Doe by name
    res = client.get("/api/v1/patients/search?query=John", headers=doctor_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    assert data["items"][0]["full_name"] == "John Doe"

    # Search for seeded John Doe by Date of Birth (1985-06-15)
    res_dob = client.get(
        "/api/v1/patients/search?query=1985-06-15", headers=doctor_headers
    )
    assert res_dob.status_code == 200
    dob_data = res_dob.json()
    assert dob_data["total"] >= 1
    assert dob_data["items"][0]["full_name"] == "John Doe"

    # Search with no matches
    res_empty = client.get(
        "/api/v1/patients/search?query=UnknownPerson12345", headers=doctor_headers
    )
    assert res_empty.status_code == 200
    assert res_empty.json()["total"] == 0
    assert res_empty.json()["items"] == []


def test_medical_profile_and_history_updates(client, doctor_headers):
    # First search for a patient to get ID
    search_res = client.get(
        "/api/v1/patients/search?query=John", headers=doctor_headers
    )
    patient_id = search_res.json()["items"][0]["id"]

    # Retrieve patient profile
    get_res = client.get(f"/api/v1/patients/{patient_id}", headers=doctor_headers)
    assert get_res.status_code == 200

    # Update medical history
    update_payload = {
        "allergies": ["Penicillin - Severe", "Peanuts - Moderate"],
        "chronic_conditions": ["Hypertension"],
        "current_medications": ["Lisinopril 10mg", "Aspirin 81mg"],
        "visit_notes": "Patient reported feeling well.",
    }
    update_res = client.put(
        f"/api/v1/patients/{patient_id}/medical-history",
        json=update_payload,
        headers=doctor_headers,
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert "Peanuts - Moderate" in updated_data["allergies"]
    assert updated_data["visit_notes"] == "Patient reported feeling well."


def test_rbac_and_field_masking(client, receptionist_headers, doctor_headers):
    # Search for patient ID
    search_res = client.get(
        "/api/v1/patients/search?query=John", headers=doctor_headers
    )
    patient_id = search_res.json()["items"][0]["id"]

    # Receptionist views profile -> SSN should be masked
    rec_res = client.get(f"/api/v1/patients/{patient_id}", headers=receptionist_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["ssn"].startswith("XXX-XX-")

    # Receptionist attempts to update medical history -> 403 Forbidden
    update_payload = {"allergies": ["Latex"], "visit_notes": "Unauthorized edit"}
    forbidden_res = client.put(
        f"/api/v1/patients/{patient_id}/medical-history",
        json=update_payload,
        headers=receptionist_headers,
    )
    assert forbidden_res.status_code == 403


def test_unauthenticated_access(client):
    res = client.get("/api/v1/patients/PAT-1001")
    assert res.status_code == 401
