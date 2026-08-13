def test_get_admin_analytics_librarian(client, librarian_headers):
    response = client.get("/api/v1/admin/analytics", headers=librarian_headers)
    assert response.status_code == 200
    data = response.json()
    assert "most_popular_genres" in data
    assert "turn_around_rates" in data
    assert "active_members_count" in data
    assert "total_fines_collected" in data

    assert isinstance(data["most_popular_genres"], list)
    assert isinstance(data["turn_around_rates"], dict)
    assert "average_turnaround_days" in data["turn_around_rates"]
    assert "total_returned_loans" in data["turn_around_rates"]
    assert isinstance(data["active_members_count"], int)
    assert data["active_members_count"] >= 1
    assert isinstance(data["total_fines_collected"], (int, float))


def test_get_admin_analytics_member_forbidden(client, member_headers):
    response = client.get("/api/v1/admin/analytics", headers=member_headers)
    assert response.status_code == 403


def test_get_admin_analytics_unauthenticated(client):
    response = client.get("/api/v1/admin/analytics")
    assert response.status_code == 401
