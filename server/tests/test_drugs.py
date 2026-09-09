from datetime import date, timedelta


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == 200


def test_create_drug(client):
    payload = {
        "name": "Amoxicillin 500mg",
        "generic_name": "Amoxicillin",
        "dosage": "500mg",
        "manufacturer": "PharmaCorp",
        "batch_number": "BATCH-2026-A",
        "stock_quantity": 500,
        "expiration_date": str(date.today() + timedelta(days=365)),
        "category": "Antibiotics",
        "unit_price": 15.00,
    }
    response = client.post("/api/v1/drugs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["name"] == payload["name"]
    assert data["stock_quantity"] == 500
    assert data["is_low_stock"] is False
    assert data["is_near_expiry"] is False


def test_list_drugs(client):
    response = client.get("/api/v1/drugs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "low_stock_count" in data
    assert "near_expiry_count" in data


def test_get_drug_by_id(client):
    payload = {
        "name": "Paracetamol 500mg",
        "generic_name": "Paracetamol",
        "dosage": "500mg",
        "manufacturer": "HealthCorp",
        "batch_number": "BATCH-2026-P",
        "stock_quantity": 100,
        "expiration_date": str(date.today() + timedelta(days=200)),
        "category": "Analgesics",
        "unit_price": 5.00,
    }
    create_res = client.post("/api/v1/drugs", json=payload)
    drug_id = create_res.json()["id"]

    response = client.get(f"/api/v1/drugs/{drug_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == drug_id
    assert data["name"] == "Paracetamol 500mg"


def test_update_drug(client):
    payload = {
        "name": "Ibuprofen 200mg",
        "generic_name": "Ibuprofen",
        "dosage": "200mg",
        "manufacturer": "MediCorp",
        "batch_number": "BATCH-2026-I",
        "stock_quantity": 60,
        "expiration_date": str(date.today() + timedelta(days=100)),
        "category": "Analgesics",
        "unit_price": 8.00,
    }
    create_res = client.post("/api/v1/drugs", json=payload)
    drug_id = create_res.json()["id"]

    update_payload = {"stock_quantity": 20, "unit_price": 8.50}
    update_res = client.put(f"/api/v1/drugs/{drug_id}", json=update_payload)
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["stock_quantity"] == 20
    assert data["is_low_stock"] is True
    assert data["unit_price"] == 8.50


def test_delete_drug(client):
    payload = {
        "name": "Aspirin 100mg",
        "generic_name": "Aspirin",
        "dosage": "100mg",
        "manufacturer": "Bayer",
        "batch_number": "BATCH-2026-ASP",
        "stock_quantity": 200,
        "expiration_date": str(date.today() + timedelta(days=300)),
        "category": "Analgesics",
        "unit_price": 4.50,
    }
    create_res = client.post("/api/v1/drugs", json=payload)
    drug_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/drugs/{drug_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/drugs/{drug_id}")
    assert get_res.status_code == 404


def test_low_stock_and_near_expiry_alerts(client):
    # Low stock & near expiry drug
    drug_alert = {
        "name": "Emergency Epinephrine",
        "generic_name": "Epinephrine",
        "dosage": "0.3mg",
        "manufacturer": "LifeSave",
        "batch_number": "BATCH-EMERGENCY",
        "stock_quantity": 10,  # < 50 => low stock
        "expiration_date": str(
            date.today() + timedelta(days=15)
        ),  # <= 30 days => near expiry
        "category": "Emergency",
        "unit_price": 50.00,
    }
    create_res = client.post("/api/v1/drugs", json=drug_alert)
    data = create_res.json()
    assert data["is_low_stock"] is True
    assert data["is_near_expiry"] is True


def test_validation_errors(client):
    invalid_payload = {
        "name": "Invalid Drug",
        "generic_name": "Invalid",
        "dosage": "10mg",
        "manufacturer": "Unknown",
        "batch_number": "BATCH-000",
        "stock_quantity": -5,  # negative stock should fail
        "expiration_date": str(date.today()),
        "category": "Test",
        "unit_price": 0.0,  # zero unit price should fail
    }
    res = client.post("/api/v1/drugs", json=invalid_payload)
    assert res.status_code == 422
