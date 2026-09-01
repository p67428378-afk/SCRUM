def test_favorite_operations(client, test_buyer_token):
    headers = {"Authorization": f"Bearer {test_buyer_token}"}

    # 1. Get first property ID
    props_res = client.get("/api/v1/properties")
    assert props_res.status_code == 200
    props = props_res.json()["items"]
    assert len(props) > 0
    prop_id = props[0]["id"]

    # 2. Add property to favorites
    add_res = client.post(f"/api/v1/favorites/{prop_id}", headers=headers)
    assert add_res.status_code == 201
    assert add_res.json()["property_id"] == prop_id

    # 3. List favorites
    get_res = client.get("/api/v1/favorites", headers=headers)
    assert get_res.status_code == 200
    favs = get_res.json()
    assert len(favs) >= 1
    fav_ids = [f["id"] for f in favs]
    assert prop_id in fav_ids

    # 4. Remove property from favorites
    del_res = client.delete(f"/api/v1/favorites/{prop_id}", headers=headers)
    assert del_res.status_code == 200

    # 5. Verify removed
    get_res_after = client.get("/api/v1/favorites", headers=headers)
    assert get_res_after.status_code == 200
    fav_ids_after = [f["id"] for f in get_res_after.json()]
    assert prop_id not in fav_ids_after


def test_favorites_unauthenticated(client):
    response = client.get("/api/v1/favorites")
    assert response.status_code == 401
