from fastapi import status


def test_create_todo(client):
    payload = {
        "title": "Test Task",
        "description": "This is a test task description",
        "due_date": "2026-08-01T12:00:00",
        "priority": "High",
    }
    response = client.post("/api/v1/todos", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task description"
    assert data["priority"] == "High"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_todo_invalid_priority(client):
    payload = {
        "title": "Test Task",
        "description": "This is a test task description",
        "priority": "Urgent",  # Invalid priority
    }
    response = client.post("/api/v1/todos", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_todo_empty_title(client):
    payload = {
        "title": "",
        "description": "This is a test task description",
        "priority": "Medium",
    }
    response = client.post("/api/v1/todos", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_todos(client):
    # Create a todo first
    payload = {
        "title": "Task to Get",
        "description": "Get description",
        "priority": "Low",
    }
    client.post("/api/v1/todos", json=payload)

    response = client.get("/api/v1/todos")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert any(item["title"] == "Task to Get" for item in data)


def test_update_todo(client):
    # Create a todo first
    payload = {
        "title": "Task to Update",
        "description": "Old description",
        "priority": "Medium",
    }
    create_resp = client.post("/api/v1/todos", json=payload)
    todo_id = create_resp.json()["id"]

    # Update it
    update_payload = {
        "title": "Updated Task Title",
        "description": "New description",
        "priority": "High",
    }
    response = client.put(f"/api/v1/todos/{todo_id}", json=update_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Task Title"
    assert data["description"] == "New description"
    assert data["priority"] == "High"


def test_update_todo_not_found(client):
    update_payload = {
        "title": "Updated Task Title",
        "description": "New description",
        "priority": "High",
    }
    response = client.put("/api/v1/todos/non-existent-id", json=update_payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_todo(client):
    # Create a todo first
    payload = {
        "title": "Task to Delete",
        "description": "Delete description",
        "priority": "Low",
    }
    create_resp = client.post("/api/v1/todos", json=payload)
    todo_id = create_resp.json()["id"]

    # Delete it
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's deleted
    get_resp = client.get("/api/v1/todos")
    data = get_resp.json()
    assert not any(item["id"] == todo_id for item in data)


def test_delete_todo_not_found(client):
    response = client.delete("/api/v1/todos/non-existent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND
