def test_list_movies_public(client):
    response = client.get("/api/v1/movies")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_search_and_filter_movies(client):
    response = client.get("/api/v1/movies?search=Inception")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["title"] == "Inception"


def test_get_movie_detail(client):
    response = client.get("/api/v1/movies")
    movie_id = response.json()["items"][0]["id"]

    detail_res = client.get(f"/api/v1/movies/{movie_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == movie_id


def test_create_movie_forbidden_for_regular_user(client, user_token_headers):
    payload = {
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole in space.",
        "release_year": 2014,
        "age_rating": "PG-13",
        "duration": 169,
    }
    response = client.post("/api/v1/movies", json=payload, headers=user_token_headers)
    assert response.status_code == 403


def test_create_movie_as_admin(client, admin_token_headers):
    payload = {
        "title": "The Matrix",
        "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        "release_year": 1999,
        "age_rating": "R",
        "duration": 136,
        "genre_names": ["Sci-Fi", "Action"],
    }
    response = client.post("/api/v1/movies", json=payload, headers=admin_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "The Matrix"
    assert len(data["genres"]) >= 1


def test_update_and_soft_delete_movie(client, admin_token_headers):
    # Create
    payload = {"title": "Movie to Delete", "release_year": 2020}
    create_res = client.post(
        "/api/v1/movies", json=payload, headers=admin_token_headers
    )
    movie_id = create_res.json()["id"]

    # Update
    update_res = client.put(
        f"/api/v1/movies/{movie_id}",
        json={"title": "Updated Title"},
        headers=admin_token_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Title"

    # Soft Delete
    del_res = client.delete(f"/api/v1/movies/{movie_id}", headers=admin_token_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "SoftDeleted"

    # Verify public listing excludes soft-deleted movie
    list_res = client.get("/api/v1/movies")
    movie_ids = [m["id"] for m in list_res.json()["items"]]
    assert movie_id not in movie_ids
