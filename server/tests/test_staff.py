def test_list_staff(client):
    response = client.get("/api/v1/staff")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_create_staff_with_schedule(client):
    # Fetch a service ID first
    svc_res = client.get("/api/v1/services")
    services = svc_res.json()
    svc_id = services[0]["id"]

    payload = {
        "full_name": "Maria Garcia",
        "email": "maria@salon.com",
        "phone": "+15550199",
        "is_active": True,
        "service_ids": [svc_id],
        "working_hours": [
            {
                "day_of_week": 0,
                "start_time": "09:00",
                "end_time": "17:00",
                "break_start": "12:00",
                "break_end": "13:00",
            }
        ],
    }

    create_res = client.post("/api/v1/staff", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["full_name"] == "Maria Garcia"
    assert len(created["services"]) == 1
    assert len(created["schedules"]) == 1

    staff_id = created["id"]
    get_res = client.get(f"/api/v1/staff/{staff_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["email"] == "maria@salon.com"
