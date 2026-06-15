def test_create_task_success(client):
    response = client.post("/api/v1/tasks", json={"content": "Test Task"})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test Task"
    assert data["is_completed"] is False
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_create_task_empty_content(client):
    response = client.post("/api/v1/tasks", json={"content": ""})
    assert response.status_code == 400
    assert response.json()["detail"] == "Content is empty or exceeds 255 characters"

def test_create_task_too_long_content(client):
    response = client.post("/api/v1/tasks", json={"content": "a" * 256})
    assert response.status_code == 400
    assert response.json()["detail"] == "Content is empty or exceeds 255 characters"

def test_create_task_invalid_json(client):
    response = client.post("/api/v1/tasks", json={})
    assert response.status_code == 422

def test_get_tasks(client):
    # Create two tasks
    client.post("/api/v1/tasks", json={"content": "Task 1"})
    client.post("/api/v1/tasks", json={"content": "Task 2"})
    
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["content"] == "Task 1"
    assert data[1]["content"] == "Task 2"

def test_update_task_success(client):
    # Create a task
    create_resp = client.post("/api/v1/tasks", json={"content": "Original Task"})
    task_id = create_resp.json()["id"]
    
    # Update content and is_completed
    update_resp = client.put(f"/api/v1/tasks/{task_id}", json={"content": "Updated Task", "is_completed": True})
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["content"] == "Updated Task"
    assert data["is_completed"] is True

def test_update_task_not_found(client):
    response = client.put("/api/v1/tasks/non-existent-id", json={"content": "Updated Task"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"

def test_update_task_empty_content(client):
    create_resp = client.post("/api/v1/tasks", json={"content": "Original Task"})
    task_id = create_resp.json()["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={"content": ""})
    assert response.status_code == 400
    assert response.json()["detail"] == "Content is empty or exceeds 255 characters"

def test_delete_task_success(client):
    create_resp = client.post("/api/v1/tasks", json={"content": "Task to Delete"})
    task_id = create_resp.json()["id"]
    
    delete_resp = client.delete(f"/api/v1/tasks/{task_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["detail"] == "Task deleted successfully"
    
    # Verify it's gone
    get_resp = client.get("/api/v1/tasks")
    assert len(get_resp.json()) == 0

def test_delete_task_not_found(client):
    response = client.delete("/api/v1/tasks/non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"
