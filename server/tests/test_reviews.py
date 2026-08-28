def test_create_review_and_earn_loyalty_points(client, auth_headers):
    # Get product
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    # Initial rewards balance
    init_balance_res = client.get("/api/v1/rewards/balance", headers=auth_headers)
    initial_points = init_balance_res.json()["points_balance"]

    # Post a review
    review_res = client.post(
        "/api/v1/reviews",
        json={
            "product_id": product_id,
            "rating": 5,
            "comment": "Absolutely loved this item! Great quality and fast shipping.",
        },
        headers=auth_headers,
    )
    assert review_res.status_code == 201
    data = review_res.json()
    assert data["product_id"] == product_id
    assert data["rating"] == 5
    assert data["points_awarded"] == 50
    assert data["new_total_points"] == initial_points + 50

    # Verify updated rewards balance
    after_balance_res = client.get("/api/v1/rewards/balance", headers=auth_headers)
    assert after_balance_res.json()["points_balance"] == initial_points + 50

    # Get product reviews
    reviews_res = client.get(f"/api/v1/products/{product_id}/reviews")
    assert reviews_res.status_code == 200
    rev_data = reviews_res.json()
    assert rev_data["product_id"] == product_id
    assert rev_data["total_reviews"] >= 1
    assert rev_data["average_rating"] == 5.0
    assert len(rev_data["reviews"]) >= 1
    assert rev_data["reviews"][0]["rating"] == 5
    assert "Great quality" in rev_data["reviews"][0]["comment"]


def test_review_unauthenticated(client):
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    res = client.post(
        "/api/v1/reviews",
        json={"product_id": product_id, "rating": 4, "comment": "Nice product"},
    )
    assert res.status_code == 401


def test_review_nonexistent_product(client, auth_headers):
    res = client.post(
        "/api/v1/reviews",
        json={"product_id": "nonexistent-product-id", "rating": 4, "comment": "Good"},
        headers=auth_headers,
    )
    assert res.status_code == 404


def test_review_invalid_rating(client, auth_headers):
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    # Rating 6 (out of range 1-5)
    res_high = client.post(
        "/api/v1/reviews",
        json={"product_id": product_id, "rating": 6, "comment": "Too high"},
        headers=auth_headers,
    )
    assert res_high.status_code == 422

    # Rating 0 (out of range 1-5)
    res_low = client.post(
        "/api/v1/reviews",
        json={"product_id": product_id, "rating": 0, "comment": "Too low"},
        headers=auth_headers,
    )
    assert res_low.status_code == 422
