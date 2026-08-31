def test_create_and_get_project(client, member_auth_headers):
    # Create project
    create_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={
            "name": "Q3 Analytics Platform",
            "description": "Analytics tracking project",
            "status": "Planning",
        },
    )
    assert create_res.status_code == 201
    project_data = create_res.json()
    assert project_data["name"] == "Q3 Analytics Platform"
    assert project_data["status"] == "Planning"
    proj_id = project_data["id"]

    # Get project by ID
    get_res = client.get(f"/api/v1/projects/{proj_id}", headers=member_auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # List projects
    list_res = client.get("/api/v1/projects", headers=member_auth_headers)
    assert list_res.status_code == 200
    assert any(p["id"] == proj_id for p in list_res.json())


def test_update_project(client, member_auth_headers):
    # Create project
    create_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Sprint 1", "status": "Planning"},
    )
    proj_id = create_res.json()["id"]

    # Update project status
    update_res = client.put(
        f"/api/v1/projects/{proj_id}",
        headers=member_auth_headers,
        json={"status": "In Progress"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"


def test_project_not_found(client, member_auth_headers):
    res = client.get("/api/v1/projects/nonexistent-uuid", headers=member_auth_headers)
    assert res.status_code == 404
