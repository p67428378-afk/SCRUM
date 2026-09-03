def test_get_tables(client):
    res = client.get("/api/v1/tables")
    assert res.status_code == 200
    tables = res.json()
    assert len(tables) >= 8
    assert tables[0]["table_number"] == 1


def test_create_reservation_success(client):
    tables = client.get("/api/v1/tables").json()
    table = tables[0]

    payload = {
        "table_id": table["id"],
        "customer_name": "Alice Smith",
        "party_size": 2,
        "reservation_time": "2026-06-01 18:00",
        "notes": "Window seat preferred",
    }

    res = client.post("/api/v1/tables/reservations", json=payload)
    assert res.status_code == 201
    reservation = res.json()
    assert reservation["customer_name"] == "Alice Smith"
    assert reservation["table_id"] == table["id"]

    # Table status should now be "Reserved"
    table_res = client.get(f"/api/v1/tables/{table['id']}")
    assert table_res.json()["status"] == "Reserved"


def test_double_booking_prevention(client):
    tables = client.get("/api/v1/tables").json()
    table = tables[1]

    payload1 = {
        "table_id": table["id"],
        "customer_name": "Bob Johnson",
        "party_size": 4,
        "reservation_time": "2026-06-01 19:30",
    }

    # First booking succeeds
    res1 = client.post("/api/v1/tables/reservations", json=payload1)
    assert res1.status_code == 201

    # Second booking for same table and same time slot should fail
    payload2 = {
        "table_id": table["id"],
        "customer_name": "Charlie Brown",
        "party_size": 3,
        "reservation_time": "2026-06-01 19:30",
    }

    res2 = client.post("/api/v1/tables/reservations", json=payload2)
    assert res2.status_code == 400
    assert "already reserved" in res2.json()["detail"].lower()


def test_update_table_status(client):
    tables = client.get("/api/v1/tables").json()
    table_id = tables[2]["id"]

    res = client.patch(f"/api/v1/tables/{table_id}/status", json={"status": "Occupied"})
    assert res.status_code == 200
    assert res.json()["status"] == "Occupied"
