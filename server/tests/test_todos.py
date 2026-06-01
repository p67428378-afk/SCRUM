
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..main import app
from ..database import Base, get_db

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


def test_create_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] is False


def test_create_todo_empty_title():
    response = client.post("/api/v1/todos", json={"title": ""})
    assert response.status_code == 422


def test_read_todos():
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo for Read"})
    todo_id = response.json()["id"]
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo for Read"


def test_read_todo_not_found():
    response = client.get("/api/v1/todos/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_update_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo for Update"})
    todo_id = response.json()["id"]
    response = client.put(
        f"/api/v1/todos/{todo_id}",
        json={"title": "Updated Todo", "completed": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Todo"
    assert data["completed"] is True


def test_update_todo_not_found():
    response = client.put(
        "/api/v1/todos/00000000-0000-0000-0000-000000000000",
        json={"title": "Updated Todo", "completed": True},
    )
    assert response.status_code == 404


def test_update_todo_empty_title():
    response = client.post("/api/v1/todos", json={"title": "Test Todo for Update Empty"})
    todo_id = response.json()["id"]
    response = client.put(
        f"/api/v1/todos/{todo_id}",
        json={"title": "", "completed": True},
    )
    assert response.status_code == 422


def test_delete_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo for Delete"})
    todo_id = response.json()["id"]
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Todo item deleted successfully"}


def test_delete_todo_not_found():
    response = client.delete("/api/v1/todos/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
