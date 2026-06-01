import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app
from ..database import Base, get_db
from .. import models
from datetime import datetime, timedelta

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_create_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] is False
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_create_todo_empty_title():
    response = client.post("/api/v1/todos", json={"title": ""})
    assert response.status_code == 422

def test_read_todos():
    client.post("/api/v1/todos", json={"title": "Test Todo 1"})
    client.post("/api/v1/todos", json={"title": "Test Todo 2"})
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Test Todo 1"
    assert data[1]["title"] == "Test Todo 2"

def test_read_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["id"] == todo_id

def test_read_todo_not_found():
    response = client.get("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    assert response.status_code == 404

def test_update_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    
    update_data = {"title": "Updated Todo", "completed": True}
    response = client.put(f"/api/v1/todos/{todo_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Todo"
    assert data["completed"] is True

    # Verify timestamps
    created_at = datetime.fromisoformat(data["created_at"])
    updated_at = datetime.fromisoformat(data["updated_at"])
    assert updated_at > created_at
    assert (datetime.utcnow() - updated_at) < timedelta(seconds=5)

def test_update_todo_not_found():
    response = client.put("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", json={"title": "Updated"})
    assert response.status_code == 404

def test_update_todo_empty_title():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": ""})
    assert response.status_code == 422

def test_delete_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 404

def test_delete_todo_not_found():
    response = client.delete("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    assert response.status_code == 404
