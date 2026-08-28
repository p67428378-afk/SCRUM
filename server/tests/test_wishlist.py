def test_wishlist_crud_and_move_to_cart(client, auth_headers):
    # Fetch sample product
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    # 1. Add to wishlist
    add_res = client.post(
        "/api/v1/wishlist",
        json={"product_id": product_id},
        headers=auth_headers,
    )
    assert add_res.status_code in [200, 201]

    # 2. Get wishlist
    get_res = client.get("/api/v1/wishlist", headers=auth_headers)
    assert get_res.status_code == 200
    wishlist = get_res.json()
    assert any(item["product_id"] == product_id for item in wishlist)

    # 3. Move to cart
    move_res = client.post(
        f"/api/v1/wishlist/{product_id}/move-to-cart",
        headers=auth_headers,
    )
    assert move_res.status_code == 200

    # 4. Check wishlist is now empty of this item
    get_res_after = client.get("/api/v1/wishlist", headers=auth_headers)
    assert not any(item["product_id"] == product_id for item in get_res_after.json())
