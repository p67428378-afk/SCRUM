from datetime import date, timedelta


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

    v1_response = client.get("/api/v1/health")
    assert v1_response.status_code == 200


def test_list_drugs(client):
    response = client.get("/api/v1/drugs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "low_stock_count" in data
    assert "near_expiry_count" in data
    assert data["total"] >= 3


def test_create_drug(client):
    payload = {
        "name": "Ciprofloxacin 500mg",
        "generic_name": "Ciprofloxacin",
        "dosage": "500mg",
        "manufacturer": "GlobalPharm",
        "batch_number": "BATCH-2026-X",
        "stock_quantity": 25,  # Low stock (<50)
        "expiration_date": str(date.today() + timedelta(days=10)),  # Near expiry (<30d)
        "category": "Antibiotics",
        "unit_price": 22.50,
    }
    response = client.post("/api/v1/drugs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Ciprofloxacin 500mg"
    assert data["is_low_stock"] is True
    assert data["is_near_expiry"] is True
    assert "id" in data


def test_get_drug_by_id(client):
    # First create a drug
    payload = {
        "name": "Metformin 500mg",
        "generic_name": "Metformin",
        "dosage": "500mg",
        "manufacturer": "PharmaPlus",
        "batch_number": "BATCH-2026-M",
        "stock_quantity": 200,
        "expiration_date": str(date.today() + timedelta(days=180)),
        "category": "Antidiabetics",
        "unit_price": 12.00,
    }
    create_resp = client.post("/api/v1/drugs", json=payload)
    assert create_resp.status_code == 201
    drug_id = create_resp.json()["id"]

    # Fetch details
    get_resp = client.get(f"/api/v1/drugs/{drug_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["id"] == drug_id
    assert data["name"] == "Metformin 500mg"


def test_get_drug_not_found(client):
    response = client.get("/api/v1/drugs/non-existent-uuid")
    assert response.status_code == 404


def test_update_drug(client):
    # Create a drug
    payload = {
        "name": "Aspirin 81mg",
        "generic_name": "Aspirin",
        "dosage": "81mg",
        "manufacturer": "Bayer",
        "batch_number": "BATCH-2026-ASP",
        "stock_quantity": 100,
        "expiration_date": str(date.today() + timedelta(days=365)),
        "category": "Analgesics",
        "unit_price": 4.50,
    }
    create_resp = client.post("/api/v1/drugs", json=payload)
    drug_id = create_resp.json()["id"]

    # Update stock quantity to low stock
    update_payload = {"stock_quantity": 10}
    update_resp = client.put(f"/api/v1/drugs/{drug_id}", json=update_payload)
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["stock_quantity"] == 10
    assert data["is_low_stock"] is True


def test_delete_drug(client):
    # Create a drug
    payload = {
        "name": "Temporary Drug",
        "generic_name": "Temp",
        "dosage": "100mg",
        "manufacturer": "TempCorp",
        "batch_number": "BATCH-TEMP",
        "stock_quantity": 50,
        "expiration_date": str(date.today() + timedelta(days=100)),
        "category": "General",
        "unit_price": 1.00,
    }
    create_resp = client.post("/api/v1/drugs", json=payload)
    drug_id = create_resp.json()["id"]

    # Delete drug
    del_resp = client.delete(f"/api/v1/drugs/{drug_id}")
    assert del_resp.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/v1/drugs/{drug_id}")
    assert get_resp.status_code == 404


def test_search_and_filter_drugs(client):
    # Search for Amoxicillin
    response = client.get("/api/v1/drugs?search=Amoxicillin")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Amoxicillin" in item["name"] for item in data["items"])

    # Filter by category
    cat_response = client.get("/api/v1/drugs?category=Analgesics")
    assert cat_response.status_code == 200
    cat_data = cat_response.json()
    assert cat_data["total"] >= 1
    assert all("Analgesics" in item["category"] for item in cat_data["items"])


def test_validation_errors(client):
    # Invalid price <= 0
    invalid_price = {
        "name": "Bad Price Drug",
        "generic_name": "Bad",
        "dosage": "10mg",
        "manufacturer": "BadCorp",
        "batch_number": "BATCH-BAD",
        "stock_quantity": 10,
        "expiration_date": str(date.today() + timedelta(days=100)),
        "category": "General",
        "unit_price": 0.00,
    }
    resp1 = client.post("/api/v1/drugs", json=invalid_price)
    assert resp1.status_code == 422

    # Negative stock
    negative_stock = {
        "name": "Bad Stock Drug",
        "generic_name": "Bad",
        "dosage": "10mg",
        "manufacturer": "BadCorp",
        "batch_number": "BATCH-BAD",
        "stock_quantity": -5,
        "expiration_date": str(date.today() + timedelta(days=100)),
        "category": "General",
        "unit_price": 10.00,
    }
    resp2 = client.post("/api/v1/drugs", json=negative_stock)
    assert resp2.status_code == 422
