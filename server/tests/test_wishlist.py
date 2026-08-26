def test_wishlist_flow(client, auth_headers):
    # Get product
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

    # Wishlist starts empty
    wish_res = client.get("/api/v1/wishlist", headers=auth_headers)
    assert wish_res.status_code == 200

    # Add to wishlist
    add_res = client.post(f"/api/v1/wishlist/{product['id']}", headers=auth_headers)
    assert add_res.status_code == 201
    assert add_res.json()["product_id"] == product["id"]

    # Re-adding is idempotent
    add_again_res = client.post(
        f"/api/v1/wishlist/{product['id']}", headers=auth_headers
    )
    assert add_again_res.status_code in (200, 201)

    # List wishlist
    list_res = client.get("/api/v1/wishlist", headers=auth_headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["product_id"] == product["id"] for i in items)

    # Delete from wishlist
    del_res = client.delete(f"/api/v1/wishlist/{product['id']}", headers=auth_headers)
    assert del_res.status_code == 204

    # Delete again -> 404
    del_again = client.delete(f"/api/v1/wishlist/{product['id']}", headers=auth_headers)
    assert del_again.status_code == 404
