def test_list_credits(client, auth_headers):
    response = client.get("/api/v1/actors/credits", headers=auth_headers)
    assert response.status_code == 200
    credits = response.json()
    assert len(credits) >= 2
    # Verify year descending order
    years = [c["year"] for c in credits]
    assert years == sorted(years, reverse=True)


def test_add_and_delete_credit(client, auth_headers):
    # 1. Add credit
    res1 = client.post(
        "/api/v1/actors/credits",
        headers=auth_headers,
        json={
            "category": "Television",
            "production_name": "Breaking Bad",
            "role_name": "Guest Star",
            "director": "Vince Gilligan",
            "year": 2022,
            "additional_notes": "Season 5 Episode 3",
        },
    )
    assert res1.status_code == 201
    credit_id = res1.json()["id"]
    assert res1.json()["category"] == "Television"

    # 2. Filter by category
    res2 = client.get(
        "/api/v1/actors/credits?category=Television", headers=auth_headers
    )
    assert res2.status_code == 200
    tv_credits = res2.json()
    assert any(c["id"] == credit_id for c in tv_credits)

    # 3. Delete credit
    res3 = client.delete(f"/api/v1/actors/credits/{credit_id}", headers=auth_headers)
    assert res3.status_code == 204
