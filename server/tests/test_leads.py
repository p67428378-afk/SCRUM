def test_submit_consultation_lead_success(client):
    """Test AC4: Clients can submit inquiry forms specifying budget, timeline, and location."""
    # Find a designer
    login_designer = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    designer_id = login_designer.json()["user"]["id"]

    # Submit lead with email
    lead_payload = {
        "designer_id": designer_id,
        "client_name": "Samantha Wright",
        "client_email": "samantha@wrightcoffee.com",
        "client_phone": "+1 (555) 234-5678",
        "cafe_location": "Seattle, WA - Capitol Hill",
        "estimated_budget": "$40,000 - $60,000",
        "project_timeline": "3-6 months",
        "message": "We are looking to launch an artisan pour-over coffee bar with Scandinavian minimalist aesthetics.",
    }
    res = client.post("/api/v1/leads", json=lead_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["client_name"] == "Samantha Wright"
    assert data["status"] == "new"
    assert data["cafe_location"] == "Seattle, WA - Capitol Hill"


def test_submit_lead_missing_contact_fails(client):
    """Test business rule: Consultation lead requires valid email or phone contact details."""
    login_designer = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    designer_id = login_designer.json()["user"]["id"]

    # Missing both email and phone
    invalid_payload = {
        "designer_id": designer_id,
        "client_name": "Ghost Client",
        "client_email": None,
        "client_phone": None,
        "cafe_location": "Austin, TX",
        "estimated_budget": "$20,000",
        "project_timeline": "Immediate",
        "message": "Please contact me whenever possible.",
    }
    res = client.post("/api/v1/leads", json=invalid_payload)
    assert res.status_code == 400
    assert "contact information missing" in res.json()["detail"].lower()


def test_designer_leads_dashboard_and_status_update(
    client, designer_headers, auth_headers
):
    """Test AC4: Designer can view received leads and update status."""
    # 1. Non-designer user tries to view leads -> 403 Forbidden
    res_forbidden = client.get("/api/v1/leads", headers=auth_headers)
    assert res_forbidden.status_code == 403

    # 2. Designer views leads list
    res_list = client.get("/api/v1/leads", headers=designer_headers)
    assert res_list.status_code == 200
    leads = res_list.json()["items"]
    assert len(leads) >= 1
    lead_id = leads[0]["id"]

    # 3. Update lead status to 'in_review'
    update_res = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "in_review"},
        headers=designer_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "in_review"

    # 4. Filter by status 'in_review'
    filter_res = client.get("/api/v1/leads?status=in_review", headers=designer_headers)
    assert filter_res.status_code == 200
    for l in filter_res.json()["items"]:
        assert l["status"] == "in_review"
