def test_admin_dashboard(client, admin_auth_headers):
    response = client.get("/api/v1/admin/dashboard", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "daily_bookings_count" in data
    assert "total_collections" in data
    assert "active_rituals" in data


def test_financial_report(client, admin_auth_headers):
    response = client.get("/api/v1/admin/financial-report", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "donations_count" in data


def test_create_and_list_announcements(client, admin_auth_headers):
    payload = {
        "title": "Shravan Somvar Special Darshan",
        "message": "Extended temple darshan hours during Shravan month from 4:00 AM to 11:00 PM.",
    }
    post_res = client.post(
        "/api/v1/admin/announcements", json=payload, headers=admin_auth_headers
    )
    assert post_res.status_code == 201
    announcement = post_res.json()
    assert announcement["title"] == "Shravan Somvar Special Darshan"

    get_res = client.get("/api/v1/admin/announcements")
    assert get_res.status_code == 200
    announcements = get_res.json()
    assert len(announcements) >= 1
    titles = [a["title"] for a in announcements]
    assert "Shravan Somvar Special Darshan" in titles


def test_create_new_ritual(client, admin_auth_headers):
    payload = {
        "title": "Laghu Rudra Homa",
        "description": "Powerful fire ritual performed by 11 Vedic priests chanting Sri Rudram.",
        "price": 2100.00,
        "duration_minutes": 120,
    }
    response = client.post(
        "/api/v1/admin/rituals", json=payload, headers=admin_auth_headers
    )
    assert response.status_code == 201
    ritual = response.json()
    assert ritual["title"] == "Laghu Rudra Homa"
    assert ritual["price"] == 2100.00


def test_devotee_forbidden_access(client, devotee_auth_headers):
    response = client.get("/api/v1/admin/dashboard", headers=devotee_auth_headers)
    assert response.status_code == 403
