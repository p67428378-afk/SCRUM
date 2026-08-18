def test_create_order_auto_deducts_stock(client):
    # Get Butter Croissant product ID
    products_res = client.get("/api/v1/products")
    croissant = next(p for p in products_res.json() if p["name"] == "Butter Croissant")

    # Get Flour ingredient stock before
    ingredients_res = client.get("/api/v1/ingredients")
    flour = next(i for i in ingredients_res.json() if i["name"] == "Flour")
    flour_before = flour["stock_quantity"]

    # Create instant order for 2 croissants (Croissant requires 0.15 kg flour per unit -> 0.30 kg total)
    order_res = client.post(
        "/api/v1/orders",
        json={
            "customer_name": "John Doe",
            "order_type": "Instant",
            "items": [{"product_id": croissant["id"], "quantity": 2}],
        },
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["status"] == "Completed"
    assert order_data["total_amount"] == round(croissant["price"] * 2, 2)

    # Check Flour stock after
    flour_after_res = client.get(f"/api/v1/ingredients/{flour['id']}")
    flour_after = flour_after_res.json()["stock_quantity"]
    assert round(flour_after, 2) == round(flour_before - 0.30, 2)


def test_create_order_insufficient_stock_fails(client):
    # Create an ingredient with very low stock
    ing_res = client.post(
        "/api/v1/ingredients",
        json={
            "name": "Saffron",
            "unit": "g",
            "stock_quantity": 0.05,
            "reorder_threshold": 1.0,
        },
    )
    saffron_id = ing_res.json()["id"]

    # Create a product requiring 10g Saffron
    prod_res = client.post(
        "/api/v1/products",
        json={
            "name": "Saffron Cake",
            "category": "Cake",
            "price": 20.00,
            "recipes": [{"ingredient_id": saffron_id, "quantity_required": 10.0}],
        },
    )
    saffron_cake_id = prod_res.json()["id"]

    # Try to order 1 Saffron Cake
    order_res = client.post(
        "/api/v1/orders",
        json={
            "customer_name": "Rich Client",
            "order_type": "Instant",
            "items": [{"product_id": saffron_cake_id, "quantity": 1}],
        },
    )
    assert order_res.status_code == 400
    assert "Insufficient stock" in order_res.json()["detail"]


def test_pre_order_status_lifecycle_and_cancel(client):
    products_res = client.get("/api/v1/products")
    croissant = next(p for p in products_res.json() if p["name"] == "Butter Croissant")

    # Create Pre-Order
    order_res = client.post(
        "/api/v1/orders",
        json={
            "customer_name": "Alice Smith",
            "order_type": "Pre-Order",
            "pickup_date": "2026-10-12T10:00:00Z",
            "items": [{"product_id": croissant["id"], "quantity": 1}],
        },
    )
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["status"] == "Pending"
    o_id = order["id"]

    # Update status to "In Production"
    s1 = client.patch(f"/api/v1/orders/{o_id}/status", json={"status": "In Production"})
    assert s1.status_code == 200
    assert s1.json()["status"] == "In Production"

    # Cancel order
    s2 = client.patch(f"/api/v1/orders/{o_id}/status", json={"status": "Cancelled"})
    assert s2.status_code == 200
    assert s2.json()["status"] == "Cancelled"
