
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app
from ..database import Base
from ..routers.todos import get_db

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

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo", "completed": False})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] == False
    assert "id" in data

def test_read_todos():
    client.post("/api/v1/todos", json={"title": "Test Todo 1", "completed": False})
    client.post("/api/v1/todos", json={"title": "Test Todo 2", "completed": True})
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_read_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo", "completed": False})
    todo_id = response.json()["id"]
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["id"] == todo_id

def test_update_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo", "completed": False})
    todo_id = response.json()["id"]
    updated_at_before = response.json()["updated_at"]
    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": "Updated Test Todo", "completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Test Todo"
    assert data["completed"] == True
    assert data["updated_at"] > updated_at_before

def test_delete_todo():
    response = client.post("/api/v1/todos", json={"title": "Test Todo", "completed": False})
    todo_id = response.json()["id"]
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 404
