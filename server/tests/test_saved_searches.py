def test_saved_search_operations(client, test_buyer_token):
    headers = {"Authorization": f"Bearer {test_buyer_token}"}

    # 1. Create saved search
    payload = {
        "name": "Austin 3+ Beds under $500k",
        "filter_criteria": {
            "city": "Austin",
            "min_price": 300000,
            "max_price": 500000,
            "bedrooms": 3,
        },
    }
    create_res = client.post("/api/v1/saved-searches", json=payload, headers=headers)
    assert create_res.status_code == 201
    saved_search = create_res.json()
    search_id = saved_search["id"]
    assert saved_search["name"] == "Austin 3+ Beds under $500k"
    assert saved_search["filter_criteria"]["city"] == "Austin"

    # 2. List saved searches
    get_res = client.get("/api/v1/saved-searches", headers=headers)
    assert get_res.status_code == 200
    searches = get_res.json()
    assert len(searches) >= 1
    s_ids = [s["id"] for s in searches]
    assert search_id in s_ids

    # 3. Delete saved search
    del_res = client.delete(f"/api/v1/saved-searches/{search_id}", headers=headers)
    assert del_res.status_code == 204

    # 4. Verify deleted
    get_res_after = client.get("/api/v1/saved-searches", headers=headers)
    assert get_res_after.status_code == 200
    s_ids_after = [s["id"] for s in get_res_after.json()]
    assert search_id not in s_ids_after


def test_saved_searches_unauthenticated(client):
    response = client.get("/api/v1/saved-searches")
    assert response.status_code == 401
