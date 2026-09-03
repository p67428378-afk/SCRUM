def test_list_design_posts_and_filtering(client):
    """Test AC1: Search and filter interior design concepts using multi-select facets."""
    # 1. Fetch all
    res = client.get("/api/v1/designs")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 1

    # 2. Filter by style
    res_style = client.get("/api/v1/designs?style=Industrial")
    assert res_style.status_code == 200
    for item in res_style.json()["items"]:
        assert "industrial" in item["style"].lower()

    # 3. Filter by budget tier
    res_budget = client.get("/api/v1/designs?budget_tier=Mid-Range")
    assert res_budget.status_code == 200

    # 4. Search query
    res_search = client.get("/api/v1/designs?q=Botanical")
    assert res_search.status_code == 200
    assert len(res_search.json()["items"]) >= 1

    # 5. Pagination
    res_page = client.get("/api/v1/designs?skip=0&limit=1")
    assert res_page.status_code == 200
    assert len(res_page.json()["items"]) <= 1


def test_get_design_post_detail(client):
    """Test retrieving full details of a specific design post."""
    list_res = client.get("/api/v1/designs")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) > 0
    post_id = items[0]["id"]

    detail_res = client.get(f"/api/v1/designs/{post_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == post_id
    assert "specifications" in detail
    assert "media_assets" in detail


def test_create_design_post_designer_role(client, designer_headers, auth_headers):
    """Test AC2: Designers can publish design posts with specs and taxonomy."""
    payload = {
        "title": "Zen Japandi Tea & Matcha Bar",
        "description": "Minimalist wood tones, shoji screens, and serene pebble courtyards.",
        "style": "Minimalist",
        "layout_size": "Small (< 500 sq ft)",
        "budget_tier": "Premium ($$$)",
        "color_scheme": "Warm Earth",
        "cover_image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800",
        "specifications": {
            "seating_capacity": 18,
            "tatami_platform": True,
            "lighting_style": "Washi paper pendants",
        },
    }

    # 1. Non-designer (cafe_owner) attempts to create -> 403 Forbidden
    res_forbidden = client.post("/api/v1/designs", json=payload, headers=auth_headers)
    assert res_forbidden.status_code == 403

    # 2. Designer creates -> 201 Created
    res_success = client.post("/api/v1/designs", json=payload, headers=designer_headers)
    assert res_success.status_code == 201
    created_post = res_success.json()
    assert created_post["title"] == payload["title"]
    assert created_post["style"] == "Minimalist"
    assert created_post["specifications"]["seating_capacity"] == 18


def test_update_and_delete_design_post(client, designer_headers):
    """Test modifying and deleting a design post."""
    # Create a post to update
    payload = {
        "title": "Temporary Retro Cafe",
        "style": "Vintage",
        "layout_size": "Medium (500-1500 sq ft)",
        "budget_tier": "Budget ($)",
    }
    create_res = client.post("/api/v1/designs", json=payload, headers=designer_headers)
    assert create_res.status_code == 201
    post_id = create_res.json()["id"]

    # Patch title
    patch_res = client.patch(
        f"/api/v1/designs/{post_id}",
        json={"title": "Updated Retro Espresso Bar"},
        headers=designer_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Updated Retro Espresso Bar"

    # Delete
    del_res = client.delete(f"/api/v1/designs/{post_id}", headers=designer_headers)
    assert del_res.status_code == 204

    # Verify not found
    get_res = client.get(f"/api/v1/designs/{post_id}")
    assert get_res.status_code == 404
