def test_generate_presigned_url_success(client, designer_headers):
    payload = {
        "filename": "cafe_moodboard_sketch.jpg",
        "file_type": "image/jpeg",
        "file_size_bytes": 5242880,  # 5 MB
        "asset_type": "mood_board",
    }
    response = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "upload_url" in data
    assert "file_url" in data
    assert data["expires_in_seconds"] == 900
    assert "X-Amz-Expires=900" in data["upload_url"]


def test_generate_presigned_url_file_too_large(client, designer_headers):
    payload = {
        "filename": "huge_video.mp4",
        "file_type": "video/mp4",
        "file_size_bytes": 35000000,  # 35 MB (>25MB)
        "asset_type": "mood_board",
    }
    response = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert response.status_code == 422


def test_generate_presigned_url_unsupported_mimetype(client, designer_headers):
    payload = {
        "filename": "script.exe",
        "file_type": "application/x-msdownload",
        "file_size_bytes": 1024,
        "asset_type": "mood_board",
    }
    response = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert response.status_code == 422


def test_confirm_media_upload_and_get(client, designer_headers):
    # Get a post ID
    list_res = client.get("/api/v1/designs")
    post_id = list_res.json()[0]["id"]

    payload = {
        "post_id": post_id,
        "asset_type": "floor_plan",
        "file_name": "architectural_blueprint.pdf",
        "file_url": "https://example.com/assets/blueprint.pdf",
        "file_size_bytes": 2048000,
        "mime_type": "application/pdf",
    }
    confirm_res = client.post(
        "/api/v1/media/confirm", json=payload, headers=designer_headers
    )
    assert confirm_res.status_code == 201
    asset_data = confirm_res.json()
    assert asset_data["file_name"] == payload["file_name"]
    asset_id = asset_data["id"]

    # Retrieve asset
    get_res = client.get(f"/api/v1/media/{asset_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == asset_id
