
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.main import app
from server.database import Base, get_db
from server.models import Todo

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
    assert data["completed"] is False


def test_create_todo_empty_title(db_session):
    response = client.post("/api/v1/todos", json={"title": ""})
    assert response.status_code == 422


def test_read_todos(db_session):
    todo = Todo(title="Test Todo 1")
    db_session.add(todo)
    db_session.commit()

    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Todo 1"


def test_read_todo(db_session):
    todo = Todo(title="Test Todo")
    db_session.add(todo)
    db_session.commit()

    response = client.get(f"/api/v1/todos/{todo.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"


def test_read_todo_not_found(db_session):
    response = client.get("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    assert response.status_code == 404


def test_update_todo(db_session):
    todo = Todo(title="Test Todo")
    db_session.add(todo)
    db_session.commit()

    response = client.put(f"/api/v1/todos/{todo.id}", json={"title": "Updated Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Todo"


def test_update_todo_empty_title(db_session):
    todo = Todo(title="Test Todo")
    db_session.add(todo)
    db_session.commit()

    response = client.put(f"/api/v1/todos/{todo.id}", json={"title": ""})
    assert response.status_code == 422


def test_update_todo_not_found(db_session):
    response = client.put("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", json={"title": "Updated Todo"})
    assert response.status_code == 404


def test_delete_todo(db_session):
    todo = Todo(title="Test Todo")
    db_session.add(todo)
    db_session.commit()

    response = client.delete(f"/api/v1/todos/{todo.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Todo item deleted successfully"}


def test_delete_todo_not_found(db_session):
    response = client.delete("/api/v1/todos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    assert response.status_code == 404
