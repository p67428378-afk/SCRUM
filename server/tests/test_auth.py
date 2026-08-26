def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "furniture-selling-portal"


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_login_seeded_test_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "customer"


def test_login_seeded_admin_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_register_new_user(client):
    unique_email = "newuser_reg@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "strongpassword123",
            "full_name": "Jane Furniture Lover",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "Jane Furniture Lover"


def test_register_duplicate_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "anotherpassword",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_me_authenticated(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["is_active"] is True


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_address_management_flow(client, auth_headers):
    # 1. Create address
    create_res = client.post(
        "/api/v1/auth/addresses",
        json={
            "full_name": "Test User",
            "address_line1": "456 Oak Avenue",
            "address_line2": "Apt 4B",
            "city": "Denver",
            "state": "CO",
            "postal_code": "80202",
            "country": "US",
            "phone": "555-123-4567",
            "is_default": True,
        },
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    addr = create_res.json()
    assert addr["city"] == "Denver"
    assert addr["is_default"] is True
    addr_id = addr["id"]

    # 2. List addresses
    list_res = client.get("/api/v1/auth/addresses", headers=auth_headers)
    assert list_res.status_code == 200
    addresses = list_res.json()
    assert any(a["id"] == addr_id for a in addresses)

    # 3. Update address
    update_res = client.put(
        f"/api/v1/auth/addresses/{addr_id}",
        json={"city": "Boulder", "postal_code": "80301"},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["city"] == "Boulder"

    # 4. Delete address
    del_res = client.delete(f"/api/v1/auth/addresses/{addr_id}", headers=auth_headers)
    assert del_res.status_code == 204
