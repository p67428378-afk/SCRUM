from fastapi import status


def get_auth_headers(client, email, password):
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_cat_success(client):
    # AC: Authenticated sellers can list a new cat
    # Register a seller
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller1@example.com",
            "password": "password123",
            "full_name": "Seller One",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller1@example.com", "password123")

    response = client.post(
        "/api/v1/cats",
        json={
            "name": "Milo",
            "breed": "British Shorthair",
            "age_months": 3,
            "gender": "Male",
            "price": 400.0,
            "description": "A lovely and healthy companion.",
            "image_url": "http://example.com/milo.jpg",
        },
        headers=headers,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Milo"
    assert data["breed"] == "British Shorthair"
    assert data["status"] == "Available"


def test_create_cat_unauthorized(client):
    # AC: Unauthorized users cannot list a cat
    response = client.post(
        "/api/v1/cats",
        json={
            "name": "Milo",
            "breed": "British Shorthair",
            "age_months": 3,
            "gender": "Male",
            "price": 400.0,
            "description": "A lovely and healthy companion.",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_cat_forbidden_for_buyer(client):
    # AC: Buyers cannot list a cat
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "buyer1@example.com",
            "password": "password123",
            "full_name": "Buyer One",
            "role": "buyer",
        },
    )
    headers = get_auth_headers(client, "buyer1@example.com", "password123")

    response = client.post(
        "/api/v1/cats",
        json={
            "name": "Milo",
            "breed": "British Shorthair",
            "age_months": 3,
            "gender": "Male",
            "price": 400.0,
            "description": "A lovely and healthy companion.",
        },
        headers=headers,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_cats_with_filters(client):
    # AC: Browse available cats with advanced filters
    # Register seller and create cats
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller2@example.com",
            "password": "password123",
            "full_name": "Seller Two",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller2@example.com", "password123")

    # Cat 1: Siamese, Female, 4 months, $350
    client.post(
        "/api/v1/cats",
        json={
            "name": "Luna",
            "breed": "Siamese",
            "age_months": 4,
            "gender": "Female",
            "price": 350.0,
            "description": "Playful Siamese kitten.",
        },
        headers=headers,
    )

    # Cat 2: Persian, Male, 14 months, $500
    client.post(
        "/api/v1/cats",
        json={
            "name": "Oliver",
            "breed": "Persian",
            "age_months": 14,
            "gender": "Male",
            "price": 500.0,
            "description": "Calm Persian adult.",
        },
        headers=headers,
    )

    # Filter by breed
    response = client.get("/api/v1/cats?breed=Siamese")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Luna"

    # Filter by age group (Kitten: <6 months)
    response = client.get("/api/v1/cats?age_group=Kitten")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Luna"

    # Filter by age group (Adult: >12 months)
    response = client.get("/api/v1/cats?age_group=Adult")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Oliver"

    # Filter by price range
    response = client.get("/api/v1/cats?min_price=400&max_price=600")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Oliver"

    # Search by name/breed
    response = client.get("/api/v1/cats?search=Luna")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Luna"


def test_get_cat_detail(client):
    # AC: Get detailed information for a specific cat
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller3@example.com",
            "password": "password123",
            "full_name": "Seller Three",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller3@example.com", "password123")

    create_resp = client.post(
        "/api/v1/cats",
        json={
            "name": "Bella",
            "breed": "Maine Coon",
            "age_months": 8,
            "gender": "Female",
            "price": 600.0,
            "description": "Beautiful Maine Coon.",
        },
        headers=headers,
    )
    cat_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/cats/{cat_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Bella"
    assert data["seller"]["full_name"] == "Seller Three"


def test_get_cat_not_found(client):
    # AC: Non-existent cat ID returns 404
    response = client.get("/api/v1/cats/non-existent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_cat_success(client):
    # AC: Seller can update their own listing
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller4@example.com",
            "password": "password123",
            "full_name": "Seller Four",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller4@example.com", "password123")

    create_resp = client.post(
        "/api/v1/cats",
        json={
            "name": "Bella",
            "breed": "Maine Coon",
            "age_months": 8,
            "gender": "Female",
            "price": 600.0,
            "description": "Beautiful Maine Coon.",
        },
        headers=headers,
    )
    cat_id = create_resp.json()["id"]

    response = client.put(
        f"/api/v1/cats/{cat_id}",
        json={"price": 550.0, "status": "Sold"},
        headers=headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["price"] == 550.0
    assert response.json()["status"] == "Sold"


def test_update_cat_forbidden_for_non_owner(client):
    # AC: Sellers cannot update other sellers' listings
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner@example.com",
            "password": "password123",
            "full_name": "Owner",
            "role": "seller",
        },
    )
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "nonowner@example.com",
            "password": "password123",
            "full_name": "Non-Owner",
            "role": "seller",
        },
    )

    owner_headers = get_auth_headers(client, "owner@example.com", "password123")
    non_owner_headers = get_auth_headers(client, "nonowner@example.com", "password123")

    create_resp = client.post(
        "/api/v1/cats",
        json={
            "name": "Bella",
            "breed": "Maine Coon",
            "age_months": 8,
            "gender": "Female",
            "price": 600.0,
            "description": "Beautiful Maine Coon.",
        },
        headers=owner_headers,
    )
    cat_id = create_resp.json()["id"]

    response = client.put(
        f"/api/v1/cats/{cat_id}", json={"price": 550.0}, headers=non_owner_headers
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
