def get_auth_headers(client):
    res = client.post(
        "/api/v1/users/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_wishlist_unauthenticated(client):
    response = client.get("/api/v1/wishlist")
    assert response.status_code == 401


def test_add_and_get_wishlist(client):
    headers = get_auth_headers(client)

    # Fetch products first to get a valid product_id
    prod_res = client.get("/api/v1/products")
    assert prod_res.status_code == 200
    products = prod_res.json()["items"]
    assert len(products) > 0
    product_id = products[0]["id"]

    # Add to wishlist
    add_res = client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=headers,
    )
    assert add_res.status_code == 200
    assert add_res.json()["product_id"] == product_id

    # Get wishlist
    get_res = client.get("/api/v1/wishlist", headers=headers)
    assert get_res.status_code == 200
    items = get_res.json()
    assert any(item["product_id"] == product_id for item in items)


def test_add_duplicate_wishlist_idempotent(client):
    headers = get_auth_headers(client)

    prod_res = client.get("/api/v1/products")
    products = prod_res.json()["items"]
    product_id = products[1]["id"]

    # First add
    res1 = client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=headers,
    )
    assert res1.status_code == 200

    # Second add (duplicate) should return 200 without creating duplicate
    res2 = client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=headers,
    )
    assert res2.status_code == 200
    assert "already" in res2.json()["message"].lower()

    # Check total items in wishlist for this product is 1
    get_res = client.get("/api/v1/wishlist", headers=headers)
    items = get_res.json()
    matching = [i for i in items if i["product_id"] == product_id]
    assert len(matching) == 1


def test_add_nonexistent_product_to_wishlist(client):
    headers = get_auth_headers(client)
    res = client.post(
        "/api/v1/wishlist",
        json={"product_id": "00000000-0000-0000-0000-000000000000"},
        headers=headers,
    )
    assert res.status_code == 404


def test_remove_from_wishlist(client):
    headers = get_auth_headers(client)

    prod_res = client.get("/api/v1/products")
    products = prod_res.json()["items"]
    product_id = products[0]["id"]

    # Ensure added first
    client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=headers,
    )

    # Remove item
    del_res = client.delete(f"/api/v1/wishlist/{product_id}", headers=headers)
    assert del_res.status_code == 200

    # Check wishlist no longer contains product_id
    get_res = client.get("/api/v1/wishlist", headers=headers)
    items = get_res.json()
    assert not any(item["product_id"] == product_id for item in items)


def test_remove_nonexistent_wishlist_item(client):
    headers = get_auth_headers(client)
    res = client.delete(
        "/api/v1/wishlist/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert res.status_code == 404


def test_move_wishlist_to_cart(client):
    headers = get_auth_headers(client)

    prod_res = client.get("/api/v1/products")
    products = prod_res.json()["items"]
    product_id = products[2]["id"]

    # Add to wishlist first
    client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=headers,
    )

    # Move to cart
    move_res = client.post(
        f"/api/v1/wishlist/{product_id}/move-to-cart",
        headers=headers,
    )
    assert move_res.status_code == 200

    # Verify wishlist no longer has the item
    get_res = client.get("/api/v1/wishlist", headers=headers)
    items = get_res.json()
    assert not any(item["product_id"] == product_id for item in items)

    # Verify cart has items
    cart_res = client.get("/api/v1/cart", headers=headers)
    assert cart_res.status_code == 200
    cart_items = cart_res.json()["items"]
    assert len(cart_items) > 0
