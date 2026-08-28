def test_register_and_login(client):
    register_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User",
        },
    )
    assert register_res.status_code in [200, 201]
    assert "access_token" in register_res.json()

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "password123"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


def test_get_me(client, auth_headers):
    me_res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test@example.com"
