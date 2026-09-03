def test_generate_presigned_url_valid(client, designer_headers):
    """Test AC2: Request 15-minute presigned PUT URL for media asset upload."""
    payload = {
        "filename": "cafe_floor_plan_v1.pdf",
        "file_type": "application/pdf",
        "file_size_bytes": 5 * 1024 * 1024,  # 5MB
        "asset_type": "floor_plan",
    }
    res = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert res.status_code == 201
    data = res.json()
    assert "upload_url" in data
    assert "media_asset_id" in data
    assert data["expires_in"] == 900  # 15 minutes
    assert data["asset_type"] == "floor_plan"


def test_presigned_url_file_size_limit(client, designer_headers):
    """Test business rule: File size <= 25MB constraint."""
    payload = {
        "filename": "huge_video_recording.mp4",
        "file_type": "video/mp4",
        "file_size_bytes": 30 * 1024 * 1024,  # 30MB (> 25MB)
        "asset_type": "mood_board",
    }
    res = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert res.status_code == 400
    assert "exceeds" in res.json()["detail"].lower()


def test_presigned_url_invalid_mime_type(client, designer_headers):
    """Test business rule: Content-type validation."""
    payload = {
        "filename": "malicious_script.exe",
        "file_type": "application/x-msdownload",
        "file_size_bytes": 1024,
        "asset_type": "material_spec",
    }
    res = client.post(
        "/api/v1/media/presigned-url", json=payload, headers=designer_headers
    )
    assert res.status_code == 400
    assert "unsupported" in res.json()["detail"].lower()


def test_presigned_url_requires_designer(client, auth_headers):
    """Non-designer user receives 403 Forbidden when requesting presigned upload URL."""
    payload = {
        "filename": "test_image.jpg",
        "file_type": "image/jpeg",
        "file_size_bytes": 1024 * 1024,
        "asset_type": "mood_board",
    }
    res = client.post("/api/v1/media/presigned-url", json=payload, headers=auth_headers)
    assert res.status_code == 403


def test_confirm_media_upload_and_link(client, designer_headers):
    """Test confirming media upload and linking to post."""
    # 1. Request presigned URL
    req_payload = {
        "filename": "palette.png",
        "file_type": "image/png",
        "file_size_bytes": 500000,
        "asset_type": "mood_board",
    }
    presigned_res = client.post(
        "/api/v1/media/presigned-url", json=req_payload, headers=designer_headers
    )
    assert presigned_res.status_code == 201
    asset_id = presigned_res.json()["media_asset_id"]

    # 2. Confirm without post
    confirm_res = client.post(
        "/api/v1/media/confirm",
        json={"media_asset_id": asset_id},
        headers=designer_headers,
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "uploaded"
