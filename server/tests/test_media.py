def test_request_upload_url(client, auth_headers):
    response = client.post(
        "/api/v1/actors/media/upload-url",
        headers=auth_headers,
        json={
            "filename": "headshot.jpg",
            "file_type": "image/jpeg",
            "asset_type": "headshot",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "upload_url" in data
    assert "public_url" in data
    assert "asset_id" in data


def test_request_upload_url_invalid_type(client, auth_headers):
    response = client.post(
        "/api/v1/actors/media/upload-url",
        headers=auth_headers,
        json={
            "filename": "script.exe",
            "file_type": "application/x-msdownload",
            "asset_type": "headshot",
        },
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_create_and_manage_media(client, auth_headers):
    # 1. Create a new headshot
    res1 = client.post(
        "/api/v1/actors/media",
        headers=auth_headers,
        json={
            "asset_type": "headshot",
            "url": "https://storage.googleapis.com/test/headshot2.jpg",
            "title": "Secondary Headshot",
            "is_primary": False,
            "file_size_bytes": 1024000,
        },
    )
    assert res1.status_code == 201
    media_id = res1.json()["id"]

    # 2. Set as primary headshot
    res2 = client.put(
        f"/api/v1/actors/media/{media_id}/primary",
        headers=auth_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["message"] == "Primary headshot updated successfully"

    # 3. List media and verify primary flag
    res3 = client.get("/api/v1/actors/media", headers=auth_headers)
    assert res3.status_code == 200
    media_list = res3.json()
    primary_items = [m for m in media_list if m["is_primary"]]
    assert len(primary_items) == 1
    assert primary_items[0]["id"] == media_id

    # 4. Delete media asset
    res4 = client.delete(f"/api/v1/actors/media/{media_id}", headers=auth_headers)
    assert res4.status_code == 204
