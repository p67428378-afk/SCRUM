def get_admin_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_series_crud_and_hierarchy(client):
    admin_headers = get_admin_headers(client)

    # 1. Create TV Series
    series_payload = {
        "title": "Stranger Things",
        "description": "When a young boy vanishes, a small town uncovers a mystery.",
        "release_year": 2016,
        "age_rating": "TV-14",
        "cast_members": "Millie Bobby Brown, Finn Wolfhard",
        "status": "Available",
    }
    create_series_resp = client.post(
        "/api/v1/series", json=series_payload, headers=admin_headers
    )
    assert create_series_resp.status_code == 201
    series_data = create_series_resp.json()
    series_id = series_data["id"]
    assert series_data["title"] == "Stranger Things"

    # 2. Add Season 1
    season_payload = {"season_number": 1, "title": "Season 1"}
    add_season_resp = client.post(
        f"/api/v1/series/{series_id}/seasons",
        json=season_payload,
        headers=admin_headers,
    )
    assert add_season_resp.status_code == 201
    season_data = add_season_resp.json()
    season_id = season_data["id"]
    assert season_data["season_number"] == 1

    # 3. Add Episode 1 to Season 1
    episode_payload = {
        "episode_number": 1,
        "title": "Chapter One: The Vanishing of Will Byers",
        "runtime": 48,
        "thumbnail_url": "https://example.com/st_s1e1.jpg",
        "stream_url": "https://example.com/st_s1e1.mp4",
    }
    add_ep_resp = client.post(
        f"/api/v1/seasons/{season_id}/episodes",
        json=episode_payload,
        headers=admin_headers,
    )
    assert add_ep_resp.status_code == 201
    ep_data = add_ep_resp.json()
    assert ep_data["episode_number"] == 1
    assert ep_data["title"] == "Chapter One: The Vanishing of Will Byers"

    # 4. Get TV Series detail and verify hierarchy
    get_series_resp = client.get(f"/api/v1/series/{series_id}")
    assert get_series_resp.status_code == 200
    res_data = get_series_resp.json()
    assert len(res_data["seasons"]) == 1
    assert res_data["seasons"][0]["season_number"] == 1
    assert len(res_data["seasons"][0]["episodes"]) == 1
    assert (
        res_data["seasons"][0]["episodes"][0]["title"]
        == "Chapter One: The Vanishing of Will Byers"
    )


def test_list_and_search_series(client):
    admin_headers = get_admin_headers(client)

    s1 = {
        "title": "Breaking Bad",
        "description": "High school chemistry teacher turned meth producer",
        "cast_members": "Bryan Cranston, Aaron Paul",
        "release_year": 2008,
        "status": "Available",
    }
    client.post("/api/v1/series", json=s1, headers=admin_headers)

    search_resp = client.get("/api/v1/series?search=meth")
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert len(results) >= 1
    assert any(s["title"] == "Breaking Bad" for s in results)
