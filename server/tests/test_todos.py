
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.app.main import app
from server.app.models.todo import Base, SessionLocal
from server.app.api.v1.endpoints.todos import get_db

# Create a new database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency to use the testing database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    # begin a non-ORM transaction
    trans = connection.begin()

    # bind an individual Session to the connection
    db = SessionLocal(bind=connection)

    yield db

    db.close()
    trans.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

def test_create_todo(client):
    response = client.post("/api/v1/todos", json={"description": "Test Todo"})
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Test Todo"
    assert data["completed"] is False

def test_get_todos(client):
    response = client.post("/api/v1/todos", json={"description": "Test Todo 1"})
    assert response.status_code == 200
    response = client.post("/api/v1/todos", json={"description": "Test Todo 2"})
    assert response.status_code == 200

    response = client.get("/api/v1/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_update_todo(client):
    response = client.post("/api/v1/todos", json={"description": "Test Todo"})
    assert response.status_code == 200
    todo_id = response.json()["id"]

    response = client.put(f"/api/v1/todos/{todo_id}", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True

def test_update_todo_not_found(client):
    response = client.put("/api/v1/todos/999", json={"completed": True})
    assert response.status_code == 404

