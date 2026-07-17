import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import models first to ensure they are registered on Base.metadata
from server.database import Base, get_db
from server.main import app

# Setup SQLite in-memory database for testing with StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    # Create tables in the test database
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_create_todo(client):
    response = client.post(
        "/api/v1/todos", json={"title": "Test Todo", "description": "Test Description"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["description"] == "Test Description"
    assert data["completed"] is False
    assert data["isDeleted"] is False
    assert "id" in data


def test_create_todo_empty_title(client):
    response = client.post(
        "/api/v1/todos", json={"title": "", "description": "Test Description"}
    )
    assert response.status_code == 422


def test_read_todos_empty(client):
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert data["currentPage"] == 1
    assert data["totalPages"] == 1
    assert data["totalTodos"] == 0
    assert len(data["todos"]) == 0


def test_read_todos_paginated(client):
    # Create 15 todos
    for i in range(15):
        client.post("/api/v1/todos", json={"title": f"Todo {i}"})

    response = client.get("/api/v1/todos?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["currentPage"] == 1
    assert data["totalPages"] == 2
    assert data["totalTodos"] == 15
    assert len(data["todos"]) == 10

    response = client.get("/api/v1/todos?skip=10&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["currentPage"] == 2
    assert data["totalPages"] == 2
    assert data["totalTodos"] == 15
    assert len(data["todos"]) == 5


def test_read_specific_todo(client):
    create_response = client.post("/api/v1/todos", json={"title": "Specific Todo"})
    todo_id = create_response.json()["id"]

    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Specific Todo"


def test_read_nonexistent_todo(client):
    response = client.get("/api/v1/todos/nonexistent-id")
    assert response.status_code == 404


def test_update_todo(client):
    create_response = client.post("/api/v1/todos", json={"title": "Original Title"})
    todo_id = create_response.json()["id"]

    response = client.put(
        f"/api/v1/todos/{todo_id}", json={"title": "Updated Title", "completed": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["completed"] is True


def test_update_todo_empty_title(client):
    create_response = client.post("/api/v1/todos", json={"title": "Original Title"})
    todo_id = create_response.json()["id"]

    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": ""})
    assert response.status_code == 422


def test_delete_todo(client):
    create_response = client.post("/api/v1/todos", json={"title": "To Delete"})
    todo_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/todos/{todo_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["isDeleted"] is True

    # Verify it is soft-deleted and cannot be retrieved
    get_response = client.get(f"/api/v1/todos/{todo_id}")
    assert get_response.status_code == 404

    # Verify it is not in the list
    list_response = client.get("/api/v1/todos")
    assert list_response.json()["totalTodos"] == 0
