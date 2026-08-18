def test_list_and_adjust_ingredients(client):
    res = client.get("/api/v1/ingredients")
    assert res.status_code == 200
    ingredients = res.json()
    assert len(ingredients) >= 4

    flour = next(i for i in ingredients if i["name"] == "Flour")
    ing_id = flour["id"]

    # Adjust stock
    adj_res = client.post(
        f"/api/v1/ingredients/{ing_id}/adjust",
        json={"quantity_change": 50.0, "reason": "Supplier shipment"},
    )
    assert adj_res.status_code == 200
    assert adj_res.json()["stock_quantity"] == flour["stock_quantity"] + 50.0


def test_create_and_low_stock_filter(client):
    res = client.post(
        "/api/v1/ingredients",
        json={
            "name": "Vanilla Extract",
            "unit": "liters",
            "stock_quantity": 1.0,
            "reorder_threshold": 2.0,
        },
    )
    assert res.status_code == 201
    assert res.json()["is_low_stock"] is True

    low_res = client.get("/api/v1/ingredients?low_stock_only=true")
    assert low_res.status_code == 200
    names = [i["name"] for i in low_res.json()]
    assert "Vanilla Extract" in names
