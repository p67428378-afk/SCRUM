def test_comment_crud_and_permissions(client, member_auth_headers, admin_auth_headers):
    # 1. Create project & task
    proj_res = client.post(
        "/api/v1/projects",
        headers=member_auth_headers,
        json={"name": "Comment Project"},
    )
    proj_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_auth_headers,
        json={"project_id": proj_id, "summary": "Comment Task"},
    )
    task_id = task_res.json()["id"]

    # 2. Add comment as Member
    comment_res = client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers=member_auth_headers,
        json={"body": "Initial investigation completed."},
    )
    assert comment_res.status_code == 201
    comment_id = comment_res.json()["id"]

    # 3. List comments
    list_res = client.get(
        f"/api/v1/tasks/{task_id}/comments", headers=member_auth_headers
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
    assert list_res.json()[0]["body"] == "Initial investigation completed."

    # 4. Edit comment by Author
    edit_res = client.put(
        f"/api/v1/comments/{comment_id}",
        headers=member_auth_headers,
        json={"body": "Updated comment details."},
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["body"] == "Updated comment details."

    # 5. Delete comment by Admin (permitted)
    del_res = client.delete(
        f"/api/v1/comments/{comment_id}", headers=admin_auth_headers
    )
    assert del_res.status_code == 204

    # 6. Verify deleted
    verify_res = client.get(
        f"/api/v1/tasks/{task_id}/comments", headers=member_auth_headers
    )
    assert len(verify_res.json()) == 0
