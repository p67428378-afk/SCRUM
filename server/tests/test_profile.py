def test_get_profile(client, auth_headers):
    response = client.get("/api/v1/actors/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "John Doe"
    assert data["slug"] == "john-doe"
    assert "SAG-AFTRA" in data["union_affiliations"]


def test_update_profile(client, auth_headers):
    response = client.put(
        "/api/v1/actors/profile",
        headers=auth_headers,
        json={
            "height": "6'0\"",
            "eye_color": "Blue",
            "bio": "Updated award-winning actor biography.",
            "union_affiliations": ["SAG-AFTRA", "Equity", "ACTRA"],
            "location": "New York, NY",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["height"] == "6'0\""
    assert data["eye_color"] == "Blue"
    assert data["bio"] == "Updated award-winning actor biography."
    assert "ACTRA" in data["union_affiliations"]
    assert data["location"] == "New York, NY"


def test_update_profile_name_updates_slug(client, auth_headers):
    response = client.put(
        "/api/v1/actors/profile",
        headers=auth_headers,
        json={"full_name": "Johnathan Doe"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Johnathan Doe"
    assert data["slug"] == "johnathan-doe"
