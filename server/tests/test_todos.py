import csv
import os
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

DATA_FILE = "server/app/data/todos.csv"

TEST_UUID_1 = str(uuid.uuid4())
TEST_UUID_2 = str(uuid.uuid4())

def setup_module(module):
    # Create a dummy csv file for testing
    with open(DATA_FILE, mode='w', newline='') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow({'id': TEST_UUID_1, 'description': 'Test Todo 1', 'completed': False})
        writer.writerow({'id': TEST_UUID_2, 'description': 'Test Todo 2', 'completed': True})

def teardown_module(module):
    # Remove the dummy csv file
    os.remove(DATA_FILE)

def test_read_todos():
    response = client.get("/api/v1/todos/")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_create_todo():
    response = client.post("/api/v1/todos/", json={"description": "New Todo"})
    assert response.status_code == 200
    assert response.json()["description"] == "New Todo"
    assert response.json()["completed"] == False

def test_update_todo():
    response = client.put(f"/api/v1/todos/{TEST_UUID_1}", json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] == True

def test_update_todo_not_found():
    response = client.put(f"/api/v1/todos/{uuid.uuid4()}", json={"completed": True})
    assert response.status_code == 404
