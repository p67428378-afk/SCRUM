
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.main import app
from server.database import Base, get_db
import time

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
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert not data["completed"]


def test_get_todos():
    client.post("/api/v1/todos", json={"title": "Test Todo 1"})
    client.post("/api/v1/todos", json={"title": "Test Todo 2"})
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"


def test_update_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo = response.json()
    todo_id = todo["id"]
    created_at = todo["created_at"]
    
    time.sleep(1)

    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": "Updated Todo", "completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Todo"
    assert data["completed"]
    assert data["updated_at"] > created_at


def test_delete_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 404
