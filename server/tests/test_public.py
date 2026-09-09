def test_get_public_portfolio_success(client):
    response = client.get("/api/v1/public/actors/john-doe")
    assert response.status_code == 200
    data = response.json()

    assert data["profile"]["full_name"] == "John Doe"
    assert data["profile"]["slug"] == "john-doe"
    assert "primary_headshot_url" in data
    assert "pdf_resume_url" in data
    assert "credits" in data
    assert "Film" in data["credits"]
    assert "Theater" in data["credits"]


def test_get_public_portfolio_not_found(client):
    response = client.get("/api/v1/public/actors/invalid-actor-slug")
    assert response.status_code == 404
    assert (
        response.json()["detail"]
        == "Actor portfolio not found for slug 'invalid-actor-slug'"
    )
