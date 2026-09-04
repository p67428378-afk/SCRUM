def test_list_movies(client, user_token_headers):
    response = client.get("/api/v1/movies", headers=user_token_headers)
    assert response.status_code == 200
    movies = response.json()
    assert isinstance(movies, list)
    assert len(movies) >= 1
    assert movies[0]["title"] == "Interstellar"


def test_create_movie_admin(client, admin_token_headers):
    movie_payload = {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology.",
        "genre": "Sci-Fi",
        "release_year": 2010,
        "cast_members": "Leonardo DiCaprio, Joseph Gordon-Levitt",
        "rating": "PG-13",
        "thumbnail_url": "https://example.com/inception.jpg",
        "stream_url": "https://example.com/inception.mp4",
        "is_published": True,
    }
    response = client.post(
        "/api/v1/movies", json=movie_payload, headers=admin_token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Inception"
    assert data["genre"] == "Sci-Fi"
    assert "id" in data


def test_create_movie_forbidden_for_subscriber(client, user_token_headers):
    movie_payload = {
        "title": "Unauthorized Movie",
        "genre": "Action",
        "release_year": 2023,
    }
    response = client.post(
        "/api/v1/movies", json=movie_payload, headers=user_token_headers
    )
    assert response.status_code == 403


def test_create_movie_empty_title_bad_request(client, admin_token_headers):
    movie_payload = {"title": "   ", "genre": "Action", "release_year": 2023}
    response = client.post(
        "/api/v1/movies", json=movie_payload, headers=admin_token_headers
    )
    assert response.status_code == 400


def test_get_movie_by_id(client, user_token_headers):
    # Get movie list
    movies = client.get("/api/v1/movies", headers=user_token_headers).json()
    movie_id = movies[0]["id"]

    response = client.get(f"/api/v1/movies/{movie_id}", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json()["id"] == movie_id


def test_get_movie_not_found(client, user_token_headers):
    response = client.get("/api/v1/movies/non-existent-id", headers=user_token_headers)
    assert response.status_code == 404
