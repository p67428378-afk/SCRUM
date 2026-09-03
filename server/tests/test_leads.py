def test_create_lead_inquiry_success(client):
    # Fetch designer ID
    designers_res = client.get("/api/v1/auth/designers")
    designer_id = designers_res.json()[0]["id"]

    # Fetch a design post
    designs_res = client.get("/api/v1/designs")
    post_id = designs_res.json()[0]["id"]

    payload = {
        "designer_id": designer_id,
        "post_id": post_id,
        "client_name": "Marcus Vance",
        "client_email": "marcus.cafe@example.com",
        "client_phone": "+1-555-0199",
        "cafe_location": "Seattle, WA - Capitol Hill",
        "estimated_budget": "$50k - $100k",
        "project_timeline": "3 to 6 months",
        "message": "Looking to renovate an 800 sq ft corner space into a modern Scandinavian espresso bar.",
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["client_name"] == payload["client_name"]
    assert data["status"] == "new"
    assert data["designer_id"] == designer_id
    assert data["post_id"] == post_id


def test_create_lead_invalid_designer_fails(client):
    payload = {
        "designer_id": "invalid-designer-id",
        "client_name": "Marcus Vance",
        "client_email": "marcus@example.com",
        "cafe_location": "Seattle, WA",
        "estimated_budget": "$50k - $100k",
        "project_timeline": "3 months",
        "message": "Inquiry test",
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 404


def test_designer_reads_and_updates_lead_status(
    client, designer_headers, owner_headers
):
    # 1. Create a lead for the designer
    designers_res = client.get("/api/v1/auth/designers")
    designer_id = designers_res.json()[0]["id"]

    create_payload = {
        "designer_id": designer_id,
        "client_name": "Clara Oswald",
        "client_email": "clara@soufflecatering.com",
        "client_phone": "+1-555-0245",
        "cafe_location": "Portland, OR",
        "estimated_budget": "$75k - $125k",
        "project_timeline": "1 to 3 months",
        "message": "Need a vintage French bistro layout for our new pastry & coffee shop.",
    }
    create_res = client.post("/api/v1/leads", json=create_payload)
    assert create_res.status_code == 201
    lead_id = create_res.json()["id"]

    # 2. Designer lists leads
    list_res = client.get("/api/v1/leads", headers=designer_headers)
    assert list_res.status_code == 200
    leads = list_res.json()
    assert any(l["id"] == lead_id for l in leads)

    # 3. Designer updates lead status to 'contacted'
    update_res = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "contacted"},
        headers=designer_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "contacted"

    # 4. Another user (owner) cannot change lead status -> 403
    unauth_res = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "closed"},
        headers=owner_headers,
    )
    assert unauth_res.status_code == 403
