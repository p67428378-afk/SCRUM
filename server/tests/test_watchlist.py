def test_add_to_watchlist_and_get(client, user_token_headers):
    # Get a movie ID
    movies = client.get("/api/v1/movies", headers=user_token_headers).json()
    movie_id = movies[0]["id"]

    # Add to watchlist
    response = client.post(
        "/api/v1/watchlist",
        json={"media_item_id": movie_id},
        headers=user_token_headers,
    )
    assert response.status_code in [200, 201]
    assert response.json()["media_item_id"] == movie_id

    # Test idempotency (adding same item again)
    response_dup = client.post(
        "/api/v1/watchlist",
        json={"media_item_id": movie_id},
        headers=user_token_headers,
    )
    assert response_dup.status_code in [200, 201]

    # Get watchlist
    list_response = client.get("/api/v1/watchlist", headers=user_token_headers)
    assert list_response.status_code == 200
    items = list_response.json()
    assert len(items) >= 1
    assert any(item["media_item_id"] == movie_id for item in items)


def test_remove_from_watchlist(client, user_token_headers):
    movies = client.get("/api/v1/movies", headers=user_token_headers).json()
    movie_id = movies[0]["id"]

    delete_resp = client.delete(
        f"/api/v1/watchlist/{movie_id}", headers=user_token_headers
    )
    assert delete_resp.status_code == 204

    list_response = client.get("/api/v1/watchlist", headers=user_token_headers)
    items = list_response.json()
    assert not any(item["media_item_id"] == movie_id for item in items)
