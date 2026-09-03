def test_get_boards(client, owner_headers):
    response = client.get("/api/v1/boards", headers=owner_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "name" in data[0]
    assert "is_private" in data[0]


def test_create_project_board_and_bookmark(client, owner_headers):
    # 1. Create a private board
    board_payload = {
        "name": "Roastery Counter Inspiration",
        "description": "Ideas for custom terrazzo countertops and espresso machine placement.",
        "is_private": True,
    }
    board_res = client.post("/api/v1/boards", json=board_payload, headers=owner_headers)
    assert board_res.status_code == 201
    board_data = board_res.json()
    board_id = board_data["id"]
    assert board_data["name"] == board_payload["name"]
    assert board_data["is_private"] is True

    # 2. Get existing design post to bookmark
    designs_res = client.get("/api/v1/designs")
    post_id = designs_res.json()[0]["id"]
    initial_bookmarks = designs_res.json()[0]["bookmark_count"]

    # 3. Add bookmark to board
    bm_res = client.post(
        f"/api/v1/boards/{board_id}/bookmarks",
        json={"post_id": post_id},
        headers=owner_headers,
    )
    assert bm_res.status_code == 201
    assert bm_res.json()["post_id"] == post_id

    # 4. Fetch board and verify bookmark is in board
    get_board_res = client.get(f"/api/v1/boards/{board_id}", headers=owner_headers)
    assert get_board_res.status_code == 200
    assert len(get_board_res.json()["bookmarks"]) == 1

    # 5. Remove bookmark
    del_bm_res = client.delete(
        f"/api/v1/boards/{board_id}/bookmarks/{post_id}", headers=owner_headers
    )
    assert del_bm_res.status_code == 204

    # 6. Delete board
    del_board_res = client.delete(f"/api/v1/boards/{board_id}", headers=owner_headers)
    assert del_board_res.status_code == 204


def test_private_board_unauthorized_access(client, owner_headers, designer_headers):
    # Owner creates private board
    create_res = client.post(
        "/api/v1/boards",
        json={"name": "Owner Secret Ideas", "is_private": True},
        headers=owner_headers,
    )
    board_id = create_res.json()["id"]

    # Designer tries to access owner's private board -> 403 Forbidden
    access_res = client.get(f"/api/v1/boards/{board_id}", headers=designer_headers)
    assert access_res.status_code == 403
