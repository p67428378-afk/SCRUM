def test_search_by_query(client, user_token_headers):
    response = client.get("/api/v1/search?q=Stranger", headers=user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["results"][0]["title"] == "Stranger Things"


def test_search_by_genre(client, user_token_headers):
    response = client.get("/api/v1/search?genre=Sci-Fi", headers=user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_search_no_results(client, user_token_headers):
    response = client.get(
        "/api/v1/search?q=NonExistentTitle12345", headers=user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["results"]) == 0


def test_get_recommendations(client, user_token_headers):
    response = client.get("/api/v1/search/recommendations", headers=user_token_headers)
    assert response.status_code == 200
    recommendations = response.json()
    assert isinstance(recommendations, list)
    assert len(recommendations) >= 1
