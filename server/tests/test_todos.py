
import os
import csv
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

# Use a separate file for testing
TEST_TODOS_FILE = os.path.join(settings.DATA_DIR, "test_todos.csv")


def setup_test_csv(data):
    # Ensure the data directory exists
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    with open(TEST_TODOS_FILE, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)

def teardown_test_csv():
    if os.path.exists(TEST_TODOS_FILE):
        os.remove(TEST_TODOS_FILE)

# This is our test client
client = TestClient(app)

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_create_todo():
    teardown_test_csv() # Start with a clean slate
    setup_test_csv([])

    response = client.post("/api/v1/todos/", json={"description": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Test Todo"
    assert data["completed"] is False
    assert "id" in data

    # Verify it was written to the file
    with open(TEST_TODOS_FILE, mode='r') as f:
        reader = csv.reader(f)
        lines = list(reader)
        assert len(lines) == 2 # header + 1 row
        assert lines[1][1] == "Test Todo"

    teardown_test_csv()

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_read_todos():
    teardown_test_csv()
    sample_id = str(uuid.uuid4())
    setup_test_csv([{"id": sample_id, "description": "Test 1", "completed": "False"}])

    response = client.get("/api/v1/todos/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == sample_id
    assert data[0]["description"] == "Test 1"
    assert data[0]["completed"] is False

    teardown_test_csv()

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_read_todos_empty():
    teardown_test_csv()
    setup_test_csv([])

    response = client.get("/api/v1/todos/")
    assert response.status_code == 200
    assert response.json() == []

    teardown_test_csv()

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_update_todo():
    teardown_test_csv()
    sample_id = uuid.uuid4()
    setup_test_csv([{"id": str(sample_id), "description": "Original Desc", "completed": "False"}])

    response = client.put(f"/api/v1/todos/{sample_id}", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_id)
    assert data["completed"] is True

    # Verify it was updated in the file
    with open(TEST_TODOS_FILE, mode='r') as f:
        reader = list(csv.DictReader(f))
        assert len(reader) == 1
        assert reader[0]['completed'] == 'True'

    teardown_test_csv()

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_update_todo_not_found():
    teardown_test_csv()
    setup_test_csv([])
    non_existent_id = uuid.uuid4()
    response = client.put(f"/api/v1/todos/{non_existent_id}", json={"completed": True})
    assert response.status_code == 404
    assert response.json() == {"detail": "Todo not found"}

    teardown_test_csv()

@patch('app.core.config.settings.TODOS_FILE', TEST_TODOS_FILE)
def test_create_todo_empty_description():
    teardown_test_csv()
    setup_test_csv([])
    response = client.post("/api/v1/todos/", json={"description": ""})
    assert response.status_code == 422
    assert response.json() == {"detail": "Description cannot be empty."}

    teardown_test_csv()
