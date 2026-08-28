def test_get_cart(client, auth_headers):
    res = client.get("/api/v1/cart", headers=auth_headers)
    assert res.status_code == 200
    assert "items" in res.json()
