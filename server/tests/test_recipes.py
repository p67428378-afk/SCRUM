def test_list_recipes(client):
    response = client.get("/api/v1/recipes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_create_recipe(client):
    res = client.get("/api/v1/teas")
    earl_grey = next(t for t in res.json() if t["name"] == "Traditional Earl Grey")

    recipe_payload = {
        "tea_id": earl_grey["id"],
        "steep_temperature_c": 95.0,
        "steep_time_seconds": 180,
        "leaf_water_ratio_g_per_ml": "3g / 200ml",
        "instructions": "Steep with boiling water for 3 minutes. Add lemon if desired.",
    }

    response = client.post("/api/v1/recipes", json=recipe_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["tea_id"] == earl_grey["id"]
    assert data["steep_temperature_c"] == 95.0


def test_get_recipe_by_id(client):
    res = client.get("/api/v1/recipes")
    recipe_id = res.json()[0]["id"]

    response = client.get(f"/api/v1/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["id"] == recipe_id
