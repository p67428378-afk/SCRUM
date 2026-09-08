def test_list_announcements(client, resident_headers):
    response = client.get("/api/v1/announcements", headers=resident_headers)
    assert response.status_code == 200
    announcements = response.json()
    assert isinstance(announcements, list)
    assert len(announcements) >= 1


def test_publish_announcement_admin(client, admin_headers):
    response = client.post(
        "/api/v1/announcements",
        headers=admin_headers,
        json={
            "title": "Town Hall Meeting Scheduled",
            "content": "Join us at the Community Hall this Saturday at 5 PM for the annual town hall.",
            "urgency": "Info",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Town Hall Meeting Scheduled"
    assert data["urgency"] == "Info"


def test_publish_announcement_resident_forbidden(client, resident_headers):
    response = client.post(
        "/api/v1/announcements",
        headers=resident_headers,
        json={
            "title": "Unauthorized Notice",
            "content": "Test content",
            "urgency": "Warning",
        },
    )
    assert response.status_code == 403


def test_filter_announcements_by_urgency(client, resident_headers):
    response = client.get(
        "/api/v1/announcements?urgency=Emergency", headers=resident_headers
    )
    assert response.status_code == 200
    announcements = response.json()
    for ann in announcements:
        assert ann["urgency"] == "Emergency"
