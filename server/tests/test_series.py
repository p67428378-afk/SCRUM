def test_list_series(client, user_token_headers):
    response = client.get("/api/v1/series", headers=user_token_headers)
    assert response.status_code == 200
    series = response.json()
    assert isinstance(series, list)
    assert len(series) >= 1
    assert series[0]["title"] == "Stranger Things"


def test_create_series_admin(client, admin_token_headers):
    series_payload = {
        "title": "Breaking Bad",
        "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.",
        "genre": "Drama",
        "release_year": 2008,
        "cast_members": "Bryan Cranston, Aaron Paul",
        "rating": "TV-MA",
        "thumbnail_url": "https://example.com/bb.jpg",
        "is_published": True,
        "seasons": [
            {
                "season_number": 1,
                "title": "Season 1",
                "episodes": [
                    {
                        "episode_number": 1,
                        "title": "Pilot",
                        "description": "Diagnosed with terminal lung cancer, chemistry teacher Walter White teams up with former student Jesse Pinkman.",
                        "stream_url": "https://example.com/bb_s1e1.mp4",
                        "duration_seconds": 3480,
                    }
                ],
            }
        ],
    }
    response = client.post(
        "/api/v1/series", json=series_payload, headers=admin_token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Breaking Bad"
    assert len(data["seasons"]) == 1
    assert data["seasons"][0]["episodes"][0]["title"] == "Pilot"


def test_create_series_empty_title_bad_request(client, admin_token_headers):
    series_payload = {"title": "", "genre": "Drama", "release_year": 2020}
    response = client.post(
        "/api/v1/series", json=series_payload, headers=admin_token_headers
    )
    assert response.status_code == 400
