from server.app.auth import create_access_token


def test_get_profile_success(client, test_student):
    token = create_access_token(data={"sub": test_student.email})
    response = client.get(
        "/api/v1/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_student.email
    assert data["first_name"] == test_student.first_name
    assert data["last_name"] == test_student.last_name
    assert data["preferred_name"] == test_student.preferred_name
    assert data["phone_number"] == test_student.phone_number
    assert data["profile_picture_url"] == test_student.profile_picture_url


def test_get_profile_unauthorized(client):
    response = client.get("/api/v1/profile")
    assert response.status_code == 401


def test_update_profile_success(client, test_student):
    token = create_access_token(data={"sub": test_student.email})
    response = client.put(
        "/api/v1/profile",
        json={
            "phone_number": "987-654-3210",
            "preferred_name": "Alex R.",
            "profile_picture_url": "https://example.com/new_avatar.jpg",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["phone_number"] == "987-654-3210"
    assert data["preferred_name"] == "Alex R."
    assert data["profile_picture_url"] == "https://example.com/new_avatar.jpg"


def test_update_profile_unauthorized(client):
    response = client.put("/api/v1/profile", json={"preferred_name": "New Name"})
    assert response.status_code == 401
