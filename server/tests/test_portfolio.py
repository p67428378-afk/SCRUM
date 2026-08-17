def test_get_portfolio_success(client):
    # AC: Singer Portfolio & Bio Page (Frontend): Artist showcase, music discography highlights, media gallery, biography, upcoming tour announcements.
    response = client.get("/api/v1/portfolio")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Aria Vance"
    assert "Aria Vance is an internationally acclaimed" in data["bio"]
    assert len(data["discography"]) > 0
    assert data["discography"][0]["title"] == "Whispers in the Wind"
