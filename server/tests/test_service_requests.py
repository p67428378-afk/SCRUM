def test_create_service_request_resident(client, resident_headers):
    response = client.post(
        "/api/v1/service-requests",
        headers=resident_headers,
        json={
            "title": "Leaking Pipe in Kitchen",
            "category": "Plumbing",
            "description": "Pipe under the main sink is leaking water onto the floor.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Leaking Pipe in Kitchen"
    assert data["category"] == "Plumbing"
    assert data["status"] == "Open"


def test_create_service_request_invalid_category(client, resident_headers):
    response = client.post(
        "/api/v1/service-requests",
        headers=resident_headers,
        json={
            "title": "Invalid Ticket",
            "category": "Roofing",  # Invalid
            "description": "Roof issue",
        },
    )
    assert response.status_code == 400


def test_list_service_requests(client, resident_headers):
    response = client.get("/api/v1/service-requests", headers=resident_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_service_request_status_staff(client, resident_headers, staff_headers):
    # Resident creates ticket
    create_res = client.post(
        "/api/v1/service-requests",
        headers=resident_headers,
        json={
            "title": "Street Lamp Outage",
            "category": "Electrical",
            "description": "Lamp post #4 is flickering and dim.",
        },
    )
    ticket_id = create_res.json()["id"]

    # Staff updates status to In Progress
    response = client.patch(
        f"/api/v1/service-requests/{ticket_id}",
        headers=staff_headers,
        json={"status": "In Progress"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "In Progress"


def test_assign_staff_to_ticket(client, resident_headers, admin_headers, staff_headers):
    create_res = client.post(
        "/api/v1/service-requests",
        headers=resident_headers,
        json={
            "title": "Park Bench Broken",
            "category": "Public Maintenance",
            "description": "Wooden slat broken on bench near playground.",
        },
    )
    ticket_id = create_res.json()["id"]

    # Get staff user ID
    staff_me = client.get("/api/v1/auth/me", headers=staff_headers).json()
    staff_id = staff_me["id"]

    # Admin assigns staff
    assign_res = client.patch(
        f"/api/v1/service-requests/{ticket_id}",
        headers=admin_headers,
        json={"assigned_staff_id": staff_id, "status": "In Progress"},
    )
    assert assign_res.status_code == 200
    data = assign_res.json()
    assert data["assigned_staff_id"] == staff_id
    assert data["status"] == "In Progress"
