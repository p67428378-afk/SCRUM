def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "CUSTOMER"


def test_login_failure(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_user(client):
    register_payload = {
        "email": "newuser@example.com",
        "password": "secretpassword",
        "full_name": "New User",
        "phone": "9876543210",
        "role": "CUSTOMER",
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"


def test_get_me(client, customer_headers):
    response = client.get("/api/v1/auth/me", headers=customer_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_address_management(client, customer_headers):
    # Add address
    addr_payload = {
        "street_address": "456 Turner Road",
        "city": "Mumbai",
        "postal_code": "400050",
        "is_default": True,
    }
    response = client.post(
        "/api/v1/auth/addresses", json=addr_payload, headers=customer_headers
    )
    assert response.status_code == 201
    addr_data = response.json()
    assert addr_data["street_address"] == "456 Turner Road"
    address_id = addr_data["id"]

    # List addresses
    response = client.get("/api/v1/auth/addresses", headers=customer_headers)
    assert response.status_code == 200
    addresses = response.json()
    assert any(a["id"] == address_id for a in addresses)

    # Delete address
    response = client.delete(
        f"/api/v1/auth/addresses/{address_id}", headers=customer_headers
    )
    assert response.status_code == 204
