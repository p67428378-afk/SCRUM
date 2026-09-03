from datetime import datetime, timezone, timedelta


def test_get_tables(client):
    res = client.get("/api/v1/tables")
    assert res.status_code == 200
    tables = res.json()
    assert isinstance(tables, list)
    assert len(tables) > 0


def test_create_and_update_table(client):
    create_res = client.post(
        "/api/v1/tables",
        json={"table_number": 99, "capacity": 4, "status": "Available"},
    )
    assert create_res.status_code == 201
    table_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/tables/{table_id}/status", json={"status": "Reserved"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Reserved"


def test_table_reservation_and_double_booking_prevention(client):
    # Find an available table
    tables = client.get("/api/v1/tables?status=Available").json()
    assert len(tables) > 0
    target_table = tables[0]

    res_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

    # First reservation should succeed
    res1_payload = {
        "table_id": target_table["id"],
        "customer_name": "Alice Smith",
        "party_size": 2,
        "reservation_time": res_time,
        "notes": "Window seat preferred",
    }

    res1 = client.post("/api/v1/tables/reservations", json=res1_payload)
    assert res1.status_code == 201
    assert res1.json()["customer_name"] == "Alice Smith"

    # Second reservation for same table at same time should fail with 400
    res2_payload = {
        "table_id": target_table["id"],
        "customer_name": "Bob Jones",
        "party_size": 2,
        "reservation_time": res_time,
        "notes": "Second booking attempt",
    }

    res2 = client.post("/api/v1/tables/reservations", json=res2_payload)
    assert res2.status_code == 400
    assert "already reserved" in res2.json()["detail"].lower()
