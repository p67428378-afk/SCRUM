def test_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"


def test_login_success(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "patron"


def test_login_invalid_password(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_login_nonexistent_user(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "unknown@example.com", "password": "password123"},
    )
    assert res.status_code == 401


def test_register_patron_success(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newpatron@example.com",
            "password": "secretpassword",
            "full_name": "New Library Patron",
            "role": "patron",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newpatron@example.com"
    assert data["user"]["full_name"] == "New Library Patron"
    assert data["user"]["role"] == "patron"


def test_register_duplicate_email_blocked(client):
    # test@example.com is already seeded
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "anotherpassword",
            "full_name": "Duplicate User",
            "role": "patron",
        },
    )
    assert res.status_code == 409
    assert "Email already registered" in res.json()["detail"]


def test_get_me(client, patron_headers, admin_headers):
    res_patron = client.get("/api/v1/auth/me", headers=patron_headers)
    assert res_patron.status_code == 200
    assert res_patron.json()["email"] == "test@example.com"

    res_admin = client.get("/api/v1/auth/me", headers=admin_headers)
    assert res_admin.status_code == 200
    assert res_admin.json()["email"] == "admin@example.com"


def test_update_profile(client, patron_headers, admin_headers):
    # Patron updates own profile
    res_update_me = client.put(
        "/api/v1/auth/me",
        json={"full_name": "Updated Patron Name"},
        headers=patron_headers,
    )
    assert res_update_me.status_code == 200
    assert res_update_me.json()["full_name"] == "Updated Patron Name"

    # Admin updates a patron's profile
    me = client.get("/api/v1/auth/me", headers=patron_headers).json()
    res_admin_update = client.put(
        f"/api/v1/patrons/{me['id']}",
        json={"full_name": "Admin Modified Patron"},
        headers=admin_headers,
    )
    assert res_admin_update.status_code == 200
    assert res_admin_update.json()["full_name"] == "Admin Modified Patron"


def test_list_patrons_rbac(client, admin_headers, patron_headers):
    # Admin can list patrons
    res_admin = client.get("/api/v1/patrons", headers=admin_headers)
    assert res_admin.status_code == 200
    patrons = res_admin.json()
    assert len(patrons) >= 2

    # Patron cannot list patrons (RBAC)
    res_patron = client.get("/api/v1/patrons", headers=patron_headers)
    assert res_patron.status_code == 403
