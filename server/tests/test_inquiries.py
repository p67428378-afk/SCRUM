def test_create_inquiry_success(client):
    # Get a cat ID first
    list_res = client.get("/api/v1/cats")
    cats = list_res.json()["items"]
    cat_id = cats[0]["id"]

    response = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "john@example.com",
            "buyer_phone": "123-456-7890",
            "message": "I am very interested in adopting this cat!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["buyer_name"] == "John Doe"
    assert data["buyer_email"] == "john@example.com"
    assert data["cat_id"] == cat_id
    assert "id" in data


def test_create_inquiry_non_existent_cat(client):
    response = client.post(
        "/api/v1/cats/non-existent-cat-123/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "john@example.com",
            "message": "Is this cat available?",
        },
    )
    assert response.status_code == 404


def test_create_inquiry_invalid_email(client):
    list_res = client.get("/api/v1/cats")
    cat_id = list_res.json()["items"][0]["id"]

    response = client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "John Doe",
            "buyer_email": "invalid-email-format",
            "message": "Hello",
        },
    )
    assert response.status_code == 422  # Validation error from Pydantic EmailStr


def test_list_seller_inquiries(client, seller_headers, buyer_headers):
    # Get cat ID
    list_res = client.get("/api/v1/cats")
    cat_id = list_res.json()["items"][0]["id"]

    # Post an inquiry
    client.post(
        f"/api/v1/cats/{cat_id}/inquiries",
        json={
            "buyer_name": "Inquirer One",
            "buyer_email": "inquirer@example.com",
            "message": "Hello seller!",
        },
    )

    # Seller checks inquiries
    response = client.get("/api/v1/inquiries", headers=seller_headers)
    assert response.status_code == 200
    inquiries = response.json()
    assert isinstance(inquiries, list)
    assert len(inquiries) >= 1
    assert any(i["buyer_email"] == "inquirer@example.com" for i in inquiries)

    # Buyer attempting to view inquiries should get 403 Forbidden
    buyer_res = client.get("/api/v1/inquiries", headers=buyer_headers)
    assert buyer_res.status_code == 403
