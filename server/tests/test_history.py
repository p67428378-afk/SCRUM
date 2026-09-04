def test_update_and_get_watch_history(client, user_token_headers):
    # Get a movie ID
    movies = client.get("/api/v1/movies", headers=user_token_headers).json()
    movie_id = movies[0]["id"]

    # Save progress
    history_payload = {
        "media_item_id": movie_id,
        "progress_seconds": 2730,  # 45m 30s
        "completed": False,
    }
    response = client.post(
        "/api/v1/history", json=history_payload, headers=user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["media_item_id"] == movie_id
    assert data["progress_seconds"] == 2730

    # Update progress (resume point update)
    history_payload_update = {
        "media_item_id": movie_id,
        "progress_seconds": 3600,
        "completed": True,
    }
    response_update = client.post(
        "/api/v1/history", json=history_payload_update, headers=user_token_headers
    )
    assert response_update.status_code == 200
    data_update = response_update.json()
    assert data_update["progress_seconds"] == 3600
    assert data_update["completed"] is True

    # Get history list
    get_response = client.get("/api/v1/history", headers=user_token_headers)
    assert get_response.status_code == 200
    history_list = get_response.json()
    assert len(history_list) >= 1
    assert history_list[0]["progress_seconds"] == 3600
