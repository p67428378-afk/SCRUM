
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.main import app
from server.database import Base, get_db
import pytest

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

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_book():
    response = client.post(
        "/api/v1/books/",
        json={"title": "Test Book", "author": "Test Author", "isbn": "1234567890", "publication_year": 2023, "genre": "Fiction"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Book"
    assert "book_id" in data

def test_read_books():
    response = client.get("/api/v1/books/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_create_patron():
    response = client.post(
        "/api/v1/patrons/",
        json={"name": "Test Patron", "contact_info": "test@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Patron"
    assert "patron_id" in data

def test_read_patrons():
    response = client.get("/api/v1/patrons/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_create_loan_and_return():
    # First create a book and a patron
    book_response = client.post(
        "/api/v1/books/",
        json={"title": "Loan Test Book", "author": "Test Author", "isbn": "0987654321", "publication_year": 2023, "genre": "Fiction"},
    )
    book_id = book_response.json()["book_id"]

    patron_response = client.post(
        "/api/v1/patrons/",
        json={"name": "Loan Test Patron", "contact_info": "loan@example.com"},
    )
    patron_id = patron_response.json()["patron_id"]

    # Create a loan
    loan_response = client.post(
        "/api/v1/loans/",
        json={"book_id": book_id, "patron_id": patron_id},
    )
    assert loan_response.status_code == 200
    loan_data = loan_response.json()
    assert loan_data["book_id"] == book_id
    assert loan_data["patron_id"] == patron_id
    loan_id = loan_data["loan_id"]

    # Return the loan
    return_response = client.put(f"/api/v1/loans/{loan_id}/return")
    assert return_response.status_code == 200
    return_data = return_response.json()
    assert return_data["return_date"] is not None

def test_search_books():
    # Create a book to search for
    client.post(
        "/api/v1/books/",
        json={"title": "Searchable Book", "author": "Search Author", "isbn": "1122334455", "publication_year": 2023, "genre": "Mystery"},
    )

    # Search by title
    response = client.get("/api/v1/search/?query=Searchable&type=title")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["title"] == "Searchable Book"
