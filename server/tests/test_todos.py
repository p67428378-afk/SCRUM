import os
import csv
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.crud.crud_todo import DATA_FILE

client = TestClient(app)

# Test data
TEST_DATA_FILE = "server/app/data/test_todos.csv"


def setup_module(module):
    # Create a dummy csv file for testing
    with open(TEST_DATA_FILE, mode='w', newline='') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow({'id': str(uuid.uuid4()), 'description': 'Test Todo 1', 'completed': 'False'})
        writer.writerow({'id': str(uuid.uuid4()), 'description': 'Test Todo 2', 'completed': 'True'})
    # Monkeypatch the DATA_FILE path
    import app.crud.crud_todo
    app.crud.crud_todo.DATA_FILE = TEST_DATA_FILE

def teardown_module(module):
    # Remove the dummy csv file
    os.remove(TEST_DATA_FILE)

def test_read_todos():
    response = client.get("/api/v1/todos/")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_create_todo():
    response = client.post("/api/v1/todos/", json={"description": "New Todo"})
    assert response.status_code == 200
    assert response.json()["description"] == "New Todo"
    assert response.json()["completed"] is False

def test_update_todo():
    # First, get a todo to update
    response = client.get("/api/v1/todos/")
    todos = response.json()
    todo_to_update = todos[0]
    todo_id = todo_to_update['id']

    # Now, update it
    response = client.put(f"/api/v1/todos/{todo_id}", json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] is True

def test_update_todo_not_found():
    response = client.put(f"/api/v1/todos/{uuid.uuid4()}", json={"completed": True})
    assert response.status_code == 404
