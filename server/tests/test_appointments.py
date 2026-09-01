def test_list_appointments(client):
    """Test retrieving appointments list."""
    response = client.get("/api/v1/appointments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["status"] == "SCHEDULED"


def test_get_available_slots(client):
    """Test getting available doctor slots."""
    doctor_id = "11111111-1111-4111-8111-111111111111"
    response = client.get(
        f"/api/v1/appointments/available-slots?doctor_id={doctor_id}&date=2026-09-15"
    )
    assert response.status_code == 200
    slots = response.json()
    assert isinstance(slots, list)
    # 10:00 AM - 10:30 AM is seeded, so it shouldn't be in available slots
    assert "10:00 AM - 10:30 AM" not in slots
    assert "09:00 AM - 09:30 AM" in slots


def test_create_appointment_success(client):
    """Test scheduling a new appointment."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    doctor_id = "22222222-2222-4222-8222-222222222222"
    payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": "2026-09-20",
        "time_slot": "09:00 AM - 09:30 AM",
        "appointment_type": "Consultation",
        "notes": "Initial medical consultation",
    }
    response = client.post("/api/v1/appointments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["patient_id"] == patient_id
    assert data["doctor_id"] == doctor_id
    assert data["status"] == "SCHEDULED"
    assert "id" in data


def test_create_appointment_collision(client):
    """Test booking an occupied doctor slot returns 400 with alternative slots."""
    patient_id = "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f"
    doctor_id = "11111111-1111-4111-8111-111111111111"
    # Seeded slot is 2026-09-15 at 10:00 AM - 10:30 AM
    payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": "2026-09-15",
        "time_slot": "10:00 AM - 10:30 AM",
        "appointment_type": "Checkup",
    }
    response = client.post("/api/v1/appointments", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "alternative_slots" in data
    assert isinstance(data["alternative_slots"], list)
    assert "10:00 AM - 10:30 AM" not in data["alternative_slots"]


def test_get_appointment_by_id(client):
    """Test retrieving an appointment by valid ID."""
    apt_id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
    response = client.get(f"/api/v1/appointments/{apt_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == apt_id
    assert data["time_slot"] == "10:00 AM - 10:30 AM"


def test_update_appointment(client):
    """Test updating/rescheduling an appointment."""
    apt_id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
    payload = {
        "time_slot": "02:00 PM - 02:30 PM",
        "notes": "Rescheduled per patient request",
    }
    response = client.put(f"/api/v1/appointments/{apt_id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["time_slot"] == "02:00 PM - 02:30 PM"
    assert data["notes"] == "Rescheduled per patient request"


def test_cancel_appointment(client):
    """Test cancelling an appointment."""
    apt_id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
    response = client.delete(f"/api/v1/appointments/{apt_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CANCELLED"
