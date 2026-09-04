def test_list_series_public(client):
    response = client.get("/api/v1/series")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1


def test_get_series_detail(client):
    list_res = client.get("/api/v1/series")
    series_id = list_res.json()["items"][0]["id"]

    detail_res = client.get(f"/api/v1/series/{series_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["id"] == series_id
    assert len(data["seasons"]) >= 1
    assert len(data["seasons"][0]["episodes"]) >= 1


def test_create_series_season_and_episode(client, admin_token_headers):
    # 1. Create Series
    series_payload = {
        "title": "Breaking Bad",
        "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.",
        "release_year": 2008,
        "age_rating": "TV-MA",
        "genre_names": ["Drama", "Crime"],
    }
    series_res = client.post(
        "/api/v1/series", json=series_payload, headers=admin_token_headers
    )
    assert series_res.status_code == 201
    series_id = series_res.json()["id"]

    # 2. Add Season 1
    season_payload = {"season_number": 1, "title": "Season 1"}
    season_res = client.post(
        f"/api/v1/series/{series_id}/seasons",
        json=season_payload,
        headers=admin_token_headers,
    )
    assert season_res.status_code == 201
    season_id = season_res.json()["id"]

    # 3. Add Episode 1
    ep_payload = {
        "episode_number": 1,
        "title": "Pilot",
        "runtime": 58,
        "stream_url": "https://example.com/stream/ep1.mp4",
    }
    ep_res = client.post(
        f"/api/v1/seasons/{season_id}/episodes",
        json=ep_payload,
        headers=admin_token_headers,
    )
    assert ep_res.status_code == 201
    assert ep_res.json()["title"] == "Pilot"


def test_duplicate_season_number_error(client, admin_token_headers):
    # Create Series
    series_res = client.post(
        "/api/v1/series", json={"title": "Test Series"}, headers=admin_token_headers
    )
    series_id = series_res.json()["id"]

    # Add Season 1 twice
    client.post(
        f"/api/v1/series/{series_id}/seasons",
        json={"season_number": 1},
        headers=admin_token_headers,
    )
    dup_res = client.post(
        f"/api/v1/series/{series_id}/seasons",
        json={"season_number": 1},
        headers=admin_token_headers,
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]


def test_list_genres(client):
    response = client.get("/api/v1/genres")
    assert response.status_code == 200
    genres = response.json()
    assert len(genres) >= 1
