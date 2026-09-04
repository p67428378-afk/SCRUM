def get_admin_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def get_user_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_movie_crud_admin(client):
    admin_headers = get_admin_headers(client)

    # 1. Create Movie
    movie_payload = {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through dream-sharing technology.",
        "duration": 148,
        "release_year": 2010,
        "age_rating": "PG-13",
        "poster_url": "https://example.com/inception.jpg",
        "trailer_url": "https://example.com/inception_trailer.mp4",
        "stream_url": "https://example.com/inception_stream.mp4",
        "cast_members": "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
        "status": "Available",
    }
    create_resp = client.post(
        "/api/v1/movies", json=movie_payload, headers=admin_headers
    )
    assert create_resp.status_code == 201
    movie_data = create_resp.json()
    movie_id = movie_data["id"]
    assert movie_data["title"] == "Inception"

    # 2. Get Movie
    get_resp = client.get(f"/api/v1/movies/{movie_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Inception"

    # 3. Update Movie
    update_payload = {"title": "Inception (Updated)", "duration": 150}
    put_resp = client.put(
        f"/api/v1/movies/{movie_id}", json=update_payload, headers=admin_headers
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["title"] == "Inception (Updated)"

    # 4. Delete Movie (Soft Delete)
    del_resp = client.delete(f"/api/v1/movies/{movie_id}", headers=admin_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "SoftDeleted"

    # 5. Non-admin get should return 404 for soft deleted item
    get_after_del = client.get(f"/api/v1/movies/{movie_id}")
    assert get_after_del.status_code == 404


def test_movie_user_access_restrictions(client):
    user_headers = get_user_headers(client)
    movie_payload = {"title": "Unauthorized Movie"}

    # Create should fail (403)
    resp = client.post("/api/v1/movies", json=movie_payload, headers=user_headers)
    assert resp.status_code == 403


def test_list_and_search_movies(client):
    admin_headers = get_admin_headers(client)

    # Add movies
    m1 = {
        "title": "The Dark Knight",
        "description": "Batman fights Joker",
        "cast_members": "Christian Bale, Heath Ledger",
        "release_year": 2008,
        "status": "Available",
    }
    m2 = {
        "title": "Interstellar",
        "description": "Space exploration to save humanity",
        "cast_members": "Matthew McConaughey",
        "release_year": 2014,
        "status": "Available",
    }
    client.post("/api/v1/movies", json=m1, headers=admin_headers)
    client.post("/api/v1/movies", json=m2, headers=admin_headers)

    # Search for "Joker"
    search_resp = client.get("/api/v1/movies?search=Joker")
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert len(results) >= 1
    assert any(m["title"] == "The Dark Knight" for m in results)

    # Filter by release_year=2014
    year_resp = client.get("/api/v1/movies?release_year=2014")
    assert year_resp.status_code == 200
    results = year_resp.json()
    assert any(m["title"] == "Interstellar" for m in results)
