def test_list_members_staff(client, staff_headers):
    response = client.get("/api/v1/members", headers=staff_headers)
    assert response.status_code == 200
    members = response.json()
    assert isinstance(members, list)
    assert len(members) >= 1


def test_list_members_forbidden_patron(client, patron_headers):
    response = client.get("/api/v1/members", headers=patron_headers)
    assert response.status_code == 403


def test_create_member_staff(client, staff_headers):
    payload = {
        "email": "janedoe@example.com",
        "full_name": "Jane Doe",
        "phone": "555-1234",
        "membership_tier": "PREMIUM",
        "password": "securepassword",
    }
    response = client.post("/api/v1/members", json=payload, headers=staff_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["membership_tier"] == "PREMIUM"
    assert data["status"] == "ACTIVE"
    assert data["unpaid_fines"] == 0.0
    assert data["user"]["email"] == "janedoe@example.com"


def test_get_member_profile(client, staff_headers, patron_headers):
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    # Staff can view
    res_staff = client.get(f"/api/v1/members/{member_id}", headers=staff_headers)
    assert res_staff.status_code == 200
    assert res_staff.json()["id"] == member_id


def test_update_member_tier_and_status(client, admin_headers, staff_headers):
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    response = client.put(
        f"/api/v1/members/{member_id}",
        json={"membership_tier": "PREMIUM", "status": "SUSPENDED"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["membership_tier"] == "PREMIUM"
    assert data["status"] == "SUSPENDED"
