def get_admin_token(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    return resp.json()["access_token"]


def get_patron_token(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    return resp.json()["access_token"]


def test_list_patrons(client):
    admin_token = get_admin_token(client)
    patron_token = get_patron_token(client)

    # Patron list patrons -> 403 Forbidden
    resp_patron = client.get(
        "/api/v1/patrons", headers={"Authorization": f"Bearer {patron_token}"}
    )
    assert resp_patron.status_code == 403

    # Librarian list patrons -> 200 OK
    resp_admin = client.get(
        "/api/v1/patrons", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin.status_code == 200
    patrons = resp_admin.json()
    assert isinstance(patrons, list)
    assert len(patrons) >= 1


def test_patron_detail(client):
    patron_token = get_patron_token(client)
    headers = {"Authorization": f"Bearer {patron_token}"}

    me_resp = client.get("/api/v1/auth/me", headers=headers)
    patron_id = me_resp.json()["id"]

    detail_resp = client.get(f"/api/v1/patrons/{patron_id}", headers=headers)
    assert detail_resp.status_code == 200
    data = detail_resp.json()
    assert "active_loans_count" in data
    assert "unpaid_fines_balance" in data
