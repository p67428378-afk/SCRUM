def test_get_designs_list(client):
    response = client.get("/api/v1/designs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    first = data[0]
    assert "title" in first
    assert "style" in first
    assert "layout_size" in first
    assert "budget_tier" in first
    assert "designer_id" in first


def test_get_designs_filtered_by_style(client):
    response = client.get("/api/v1/designs?style=Scandinavian")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for post in data:
        assert "scandinavian" in post["style"].lower()


def test_get_designs_filtered_by_search_query(client):
    response = client.get("/api/v1/designs?q=Industrial")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(
        "Industrial" in post["title"] or "Industrial" in post["style"] for post in data
    )


def test_get_design_by_id(client):
    # Fetch list first to get an existing ID
    list_res = client.get("/api/v1/designs")
    first_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/designs/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id
    assert "designer_name" in data
    assert "media_assets" in data


def test_get_design_not_found(client):
    response = client.get("/api/v1/designs/non-existent-uuid")
    assert response.status_code == 404


def test_create_design_as_designer(client, designer_headers):
    payload = {
        "title": "Japandi Organic Wood Cafe",
        "description": "Fusion of Japanese wabi-sabi simplicity and Scandinavian functionality.",
        "style": "Minimalist",
        "layout_size": "Medium (500-1500 sq ft)",
        "budget_tier": "Mid-Range ($$)",
        "color_scheme": "Warm Earthy",
        "cover_image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
    }
    response = client.post("/api/v1/designs", json=payload, headers=designer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["style"] == payload["style"]


def test_create_design_as_owner_forbidden(client, owner_headers):
    payload = {
        "title": "Unauthorized Concept",
        "description": "Owners should not be allowed to publish portfolio designs.",
        "style": "Modern",
        "layout_size": "Compact (<500 sq ft)",
        "budget_tier": "Economy ($)",
    }
    response = client.post("/api/v1/designs", json=payload, headers=owner_headers)
    assert response.status_code == 403


def test_update_design_as_author(client, designer_headers):
    # Create first
    create_res = client.post(
        "/api/v1/designs",
        json={
            "title": "Initial Title",
            "description": "Initial description text.",
            "style": "Rustic",
            "layout_size": "Compact (<500 sq ft)",
            "budget_tier": "Economy ($)",
        },
        headers=designer_headers,
    )
    post_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/designs/{post_id}",
        json={"title": "Updated Modern Rustic Title", "budget_tier": "Mid-Range ($$)"},
        headers=designer_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Modern Rustic Title"
    assert update_res.json()["budget_tier"] == "Mid-Range ($$)"


def test_delete_design_as_author(client, designer_headers):
    create_res = client.post(
        "/api/v1/designs",
        json={
            "title": "To be deleted",
            "description": "Temporary post",
            "style": "Modern",
            "layout_size": "Compact (<500 sq ft)",
            "budget_tier": "Economy ($)",
        },
        headers=designer_headers,
    )
    post_id = create_res.json()["id"]

    delete_res = client.delete(f"/api/v1/designs/{post_id}", headers=designer_headers)
    assert delete_res.status_code == 204

    # Verify 404 on get
    get_res = client.get(f"/api/v1/designs/{post_id}")
    assert get_res.status_code == 404
