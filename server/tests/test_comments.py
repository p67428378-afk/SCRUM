def test_create_and_list_comments(client, member_headers):
    # Setup project and task
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Comment Project"}
    )
    proj_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": proj_id, "summary": "Comment Task"},
    )
    task_id = task_res.json()["id"]

    # Post comment
    c1_res = client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers=member_headers,
        json={"body": "First comment on task"},
    )
    assert c1_res.status_code == 201
    c1 = c1_res.json()
    assert c1["body"] == "First comment on task"
    assert c1["task_id"] == task_id
    assert "author_id" in c1

    # Post second comment
    c2_res = client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers=member_headers,
        json={"body": "Second comment on task"},
    )
    assert c2_res.status_code == 201

    # List comments
    list_res = client.get(f"/api/v1/tasks/{task_id}/comments", headers=member_headers)
    assert list_res.status_code == 200
    comments = list_res.json()
    assert len(comments) == 2
    assert comments[0]["body"] == "First comment on task"
    assert comments[1]["body"] == "Second comment on task"


def test_comment_on_nonexistent_task(client, member_headers):
    res = client.post(
        "/api/v1/tasks/non-existent-task-id/comments",
        headers=member_headers,
        json={"body": "Orphan comment"},
    )
    assert res.status_code == 404


def test_update_comment_permissions(client, member_headers, admin_headers):
    # Setup project and task
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Perm Project"}
    )
    proj_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": proj_id, "summary": "Perm Task"},
    )
    task_id = task_res.json()["id"]

    # Member posts comment
    c_res = client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers=member_headers,
        json={"body": "Original text by member"},
    )
    comment_id = c_res.json()["id"]

    # Member updates own comment -> 200
    upd_res = client.put(
        f"/api/v1/comments/{comment_id}",
        headers=member_headers,
        json={"body": "Edited text by author"},
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["body"] == "Edited text by author"

    # Register another member
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "othermember@example.com",
            "password": "password123",
            "full_name": "Other Member",
            "role": "Member",
        },
    )
    other_login = client.post(
        "/api/v1/auth/login",
        json={"email": "othermember@example.com", "password": "password123"},
    )
    other_headers = {"Authorization": f"Bearer {other_login.json()['access_token']}"}

    # Other member tries to edit -> 403 Forbidden
    other_upd_res = client.put(
        f"/api/v1/comments/{comment_id}",
        headers=other_headers,
        json={"body": "Malicious edit"},
    )
    assert other_upd_res.status_code == 403

    # Admin updates comment -> 200 OK
    admin_upd_res = client.put(
        f"/api/v1/comments/{comment_id}",
        headers=admin_headers,
        json={"body": "Admin moderated comment"},
    )
    assert admin_upd_res.status_code == 200
    assert admin_upd_res.json()["body"] == "Admin moderated comment"


def test_delete_comment_permissions(client, member_headers, admin_headers):
    # Setup project and task
    proj_res = client.post(
        "/api/v1/projects", headers=member_headers, json={"name": "Del Project"}
    )
    proj_id = proj_res.json()["id"]

    task_res = client.post(
        "/api/v1/tasks",
        headers=member_headers,
        json={"project_id": proj_id, "summary": "Del Task"},
    )
    task_id = task_res.json()["id"]

    # Member posts comment
    c_res = client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers=member_headers,
        json={"body": "Comment to delete"},
    )
    comment_id = c_res.json()["id"]

    # Register second member
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "second@example.com",
            "password": "password123",
            "full_name": "Second Member",
            "role": "Member",
        },
    )
    second_login = client.post(
        "/api/v1/auth/login",
        json={"email": "second@example.com", "password": "password123"},
    )
    second_headers = {"Authorization": f"Bearer {second_login.json()['access_token']}"}

    # Second member tries to delete -> 403 Forbidden
    del_forbidden = client.delete(
        f"/api/v1/comments/{comment_id}", headers=second_headers
    )
    assert del_forbidden.status_code == 403

    # Admin deletes comment -> 204 No Content
    del_ok = client.delete(f"/api/v1/comments/{comment_id}", headers=admin_headers)
    assert del_ok.status_code == 204

    # Delete non-existent comment -> 404
    del_404 = client.delete(f"/api/v1/comments/{comment_id}", headers=admin_headers)
    assert del_404.status_code == 404
