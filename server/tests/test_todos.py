
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app
from ..database import Base, get_db
from ..models import Todo
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
def run_around_tests():
    # Code that will run before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Code that will run after each test


def test_create_todo_valid_title():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert not data["completed"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    # Check if created_at is a valid ISO 8601 timestamp and is recent
    created_at = datetime.fromisoformat(data["created_at"])
    now = datetime.utcnow().replace(tzinfo=created_at.tzinfo)
    assert now - created_at < timedelta(seconds=10)


def test_create_todo_empty_title():
    response = client.post("/api/v1/todos", json={"title": ""})
    assert response.status_code == 422


def test_get_all_todos_empty():
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_todos_with_items():
    client.post("/api/v1/todos", json={"title": "Test Todo 1"})
    client.post("/api/v1/todos", json={"title": "Test Todo 2"})
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Test Todo 1"
    assert data[1]["title"] == "Test Todo 2"


def test_get_todo_by_id_valid():
    post_response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = post_response.json()["id"]
    get_response = client.get(f"/api/v1/todos/{todo_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["title"] == "Test Todo"
    assert data["id"] == todo_id


def test_get_todo_by_id_invalid():
    response = client.get(f"/api/v1/todos/invalid-id")
    assert response.status_code == 422 # Assuming UUID validation


def test_get_todo_by_id_not_found():
    import uuid
    response = client.get(f"/api/v1/todos/{uuid.uuid4()}")
    assert response.status_code == 404


def test_update_todo_valid():
    post_response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = post_response.json()["id"]
    original_updated_at = post_response.json()["updated_at"]

    import time
    time.sleep(1) # Ensure updated_at will be different

    put_response = client.put(
        f"/api/v1/todos/{todo_id}",
        json={"title": "Updated Todo", "completed": True},
    )
    assert put_response.status_code == 200
    data = put_response.json()
    assert data["title"] == "Updated Todo"
    assert data["completed"]
    assert data["id"] == todo_id
    assert data["updated_at"] > original_updated_at


def test_update_todo_not_found():
    import uuid
    response = client.put(
        f"/api/v1/todos/{uuid.uuid4()}",
        json={"title": "Updated Todo", "completed": True},
    )
    assert response.status_code == 404


def test_update_todo_empty_title():
    post_response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = post_response.json()["id"]
    response = client.put(
        f"/api/v1/todos/{todo_id}", json={"title": "", "completed": False}
    )
    assert response.status_code == 422


def test_delete_todo_valid():
    post_response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = post_response.json()["id"]
    delete_response = client.delete(f"/api/v1/todos/{todo_id}")
    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": "Todo item deleted successfully"}
    get_response = client.get(f"/api/v1/todos/{todo_id}")
    assert get_response.status_code == 404


def test_delete_todo_not_found():
    import uuid
    response = client.delete(f"/api/v1/todos/{uuid.uuid4()}")
    assert response.status_code == 404
