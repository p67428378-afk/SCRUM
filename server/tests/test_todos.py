
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

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_todo(db_session):
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] == False

def test_create_todo_empty_title(db_session):
    response = client.post("/api/v1/todos", json={"title": ""})
    assert response.status_code == 422

def test_read_todos(db_session):
    client.post("/api/v1/todos", json={"title": "Test Todo 1"})
    client.post("/api/v1/todos", json={"title": "Test Todo 2"})
    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_read_todo(db_session):
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"

def test_read_todo_not_found(db_session):
    response = client.get(f"/api/v1/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479")
    assert response.status_code == 404

def test_update_todo(db_session):
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": "Updated Todo", "completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Todo"
    assert data["completed"] == True

def test_update_todo_not_found(db_session):
    response = client.put(f"/api/v1/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479", json={"title": "Updated Todo", "completed": True})
    assert response.status_code == 404

def test_update_todo_empty_title(db_session):
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.put(f"/api/v1/todos/{todo_id}", json={"title": "", "completed": True})
    assert response.status_code == 422

def test_delete_todo(db_session):
    response = client.post("/api/v1/todos", json={"title": "Test Todo"})
    todo_id = response.json()["id"]
    response = client.delete(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 200
    response = client.get(f"/api/v1/todos/{todo_id}")
    assert response.status_code == 404

def test_delete_todo_not_found(db_session):
    response = client.delete(f"/api/v1/todos/f47ac10b-58cc-4372-a567-0e02b2c3d479")
    assert response.status_code == 404
