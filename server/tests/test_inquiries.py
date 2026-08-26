def test_submit_and_retrieve_inquiry(client):
    # 1. Get an existing listing
    listings_resp = client.get("/api/v1/listings")
    assert listings_resp.status_code == 200
    listings = listings_resp.json()
    assert len(listings) > 0
    listing_id = listings[0]["id"]

    # 2. Submit inquiry
    inquiry_resp = client.post(
        f"/api/v1/listings/{listing_id}/inquire",
        json={
            "buyer_name": "Jane Buyer",
            "buyer_email": "jane@example.com",
            "buyer_phone": "555-0199",
            "message": "Hi, I am interested in adopting this puppy. Is Max still available?",
        },
    )
    assert inquiry_resp.status_code == 201
    inquiry_data = inquiry_resp.json()
    assert inquiry_data["buyer_email"] == "jane@example.com"
    assert inquiry_data["listing_id"] == listing_id

    # 3. Retrieve inquiries as seller
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    get_inquiries_resp = client.get("/api/v1/inquiries", headers=headers)
    assert get_inquiries_resp.status_code == 200
    inquiries_list = get_inquiries_resp.json()
    assert len(inquiries_list) >= 1
    assert any(inq["id"] == inquiry_data["id"] for inq in inquiries_list)


def test_inquire_nonexistent_listing(client):
    response = client.post(
        "/api/v1/listings/nonexistent-listing-id/inquire",
        json={
            "buyer_name": "Jane Buyer",
            "buyer_email": "jane@example.com",
            "message": "Is this puppy available?",
        },
    )
    assert response.status_code == 404
