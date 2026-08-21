import pytest
from fastapi import status


@pytest.fixture(autouse=True)
def clear_rate_limits():
    from server.main import inquiry_rate_limits

    inquiry_rate_limits.clear()


def get_auth_headers(client, email, password):
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_submit_inquiry_success(client):
    # AC: Submit secure inquiry for a specific cat
    # Register seller and create a cat
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller_inq@example.com",
            "password": "password123",
            "full_name": "Seller Inq",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller_inq@example.com", "password123")

    create_resp = client.post(
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
    cat_id = create_resp.json()["id"]

    # Submit inquiry
    response = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "john@example.com",
            "buyer_phone": "123-456-7890",
            "message": "I am very interested in adopting Luna.",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["buyer_name"] == "John Doe"
    assert data["buyer_email"] == "john@example.com"
    assert data["message"] == "I am very interested in adopting Luna."


def test_submit_inquiry_invalid_email(client):
    # AC: Invalid email format blocks submission
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller_inq2@example.com",
            "password": "password123",
            "full_name": "Seller Inq 2",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller_inq2@example.com", "password123")

    create_resp = client.post(
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
    cat_id = create_resp.json()["id"]

    response = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "invalid-email",
            "message": "I am very interested.",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_inquiry_rate_limiting(client):
    # AC: Inquiry endpoint is rate limited to 5 submissions per IP per 15 minutes
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller_inq3@example.com",
            "password": "password123",
            "full_name": "Seller Inq 3",
            "role": "seller",
        },
    )
    headers = get_auth_headers(client, "seller_inq3@example.com", "password123")

    create_resp = client.post(
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
    cat_id = create_resp.json()["id"]

    # Submit 5 inquiries successfully
    for i in range(5):
        response = client.post(
            f"/api/v1/cats/{cat_id}/inquiries",
            json={
                "buyer_name": f"Buyer {i}",
                "buyer_email": f"buyer{i}@example.com",
                "message": "Interested.",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED

    # The 6th inquiry should be rate limited
    response = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "Buyer 6",
            "buyer_email": "buyer6@example.com",
            "message": "Interested.",
        },
    )
    assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "Too many inquiries" in response.json()["detail"]


def test_list_inquiries_seller_only(client):
    # AC: Sellers can view inquiries for their own cats
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller_own@example.com",
            "password": "password123",
            "full_name": "Seller Own",
            "role": "seller",
        },
    )
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "seller_other@example.com",
            "password": "password123",
            "full_name": "Seller Other",
            "role": "seller",
        },
    )

    own_headers = get_auth_headers(client, "seller_own@example.com", "password123")
    other_headers = get_auth_headers(client, "seller_other@example.com", "password123")

    # Create cat for seller_own
    create_resp = client.post(
        "/api/v1/cats",
        json={
            "name": "Luna",
            "breed": "Siamese",
            "age_months": 4,
            "gender": "Female",
            "price": 350.0,
            "description": "Playful Siamese kitten.",
        },
        headers=own_headers,
    )
    cat_id = create_resp.json()["id"]

    # Submit inquiry for seller_own's cat
    inq_resp = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "john@example.com",
            "message": "I am very interested in adopting Luna.",
        },
    )
    assert inq_resp.status_code == status.HTTP_201_CREATED

    # seller_own should see the inquiry
    response = client.get("/api/v1/inquiries", headers=own_headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["buyer_name"] == "John Doe"

    # seller_other should NOT see the inquiry
    response = client.get("/api/v1/inquiries", headers=other_headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0
