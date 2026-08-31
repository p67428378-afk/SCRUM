def test_create_project(client, member_headers):
    response = client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={
            "name": "Backend Workflow App",
            "description": "Core task workflow engine",
            "status": "Planning",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Backend Workflow App"
    assert data["status"] == "Planning"
    assert "id" in data
    assert "owner_id" in data


def test_list_projects_and_filter(client, member_headers):
    # Create two projects with different status
    client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Project Alpha", "status": "In Progress"},
    )
    client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Project Beta", "status": "Completed"},
    )

    # List all
    all_res = client.get("/api/v1/projects", headers=member_headers)
    assert all_res.status_code == 200
    all_projects = all_res.json()
    assert len(all_projects) >= 2

    # Filter by In Progress
    filtered_res = client.get(
        "/api/v1/projects?status=In Progress", headers=member_headers
    )
    assert filtered_res.status_code == 200
    for p in filtered_res.json():
        assert p["status"] == "In Progress"


def test_get_project_by_id(client, member_headers):
    create_res = client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Get Project Test", "description": "Testing GET by ID"},
    )
    project_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/projects/{project_id}", headers=member_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Get Project Test"


def test_get_nonexistent_project(client, member_headers):
    get_res = client.get(
        "/api/v1/projects/non-existent-uuid-123", headers=member_headers
    )
    assert get_res.status_code == 404
    assert get_res.json()["detail"] == "Project not found"


def test_update_project(client, member_headers):
    create_res = client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Old Project Name", "status": "Planning"},
    )
    project_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/projects/{project_id}",
        headers=member_headers,
        json={"name": "Updated Project Name", "status": "In Progress"},
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["name"] == "Updated Project Name"
    assert data["status"] == "In Progress"


def test_delete_project_rbac(client, member_headers, admin_headers):
    create_res = client.post(
        "/api/v1/projects",
        headers=member_headers,
        json={"name": "Project to Delete", "status": "On Hold"},
    )
    project_id = create_res.json()["id"]

    # Member attempt to delete -> 403 Forbidden
    del_member_res = client.delete(
        f"/api/v1/projects/{project_id}", headers=member_headers
    )
    assert del_member_res.status_code == 403
    assert "Only administrators" in del_member_res.json()["detail"]

    # Admin attempt to delete -> 204 No Content
    del_admin_res = client.delete(
        f"/api/v1/projects/{project_id}", headers=admin_headers
    )
    assert del_admin_res.status_code == 204

    # Verify project is deleted
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=member_headers)
    assert get_res.status_code == 404
