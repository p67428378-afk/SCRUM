import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from server.app.database import Base, get_db
from server.app.main import app
from server.app.models import Student, Course, Enrollment, Grade, Deadline
from server.app.auth import get_password_hash
from datetime import datetime, timedelta

# Use in-memory SQLite with StaticPool to share the connection across all sessions
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_student(db):
    student = Student(
        first_name="Alex",
        last_name="Rivera",
        preferred_name="Alex",
        email="alex.rivera@university.edu",
        phone_number="123-456-7890",
        profile_picture_url="https://example.com/avatar.jpg",
        password_hash=get_password_hash("securepassword123"),
        mfa_secret=None,  # No MFA by default
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@pytest.fixture(scope="function")
def test_student_mfa(db):
    student = Student(
        first_name="MFA",
        last_name="Student",
        preferred_name="MFA",
        email="mfa.student@university.edu",
        phone_number="123-456-7891",
        profile_picture_url="https://example.com/avatar2.jpg",
        password_hash=get_password_hash("securepassword123"),
        mfa_secret="JBSWY3DPEHPK3PXP",  # Standard base32 secret
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@pytest.fixture(scope="function")
def test_academic_data(db, test_student):
    # Create courses
    course1 = Course(
        course_code="CS-301",
        course_name="Intro to Programming",
        instructor="Dr. Jenkins",
    )
    course2 = Course(
        course_code="MATH-201", course_name="Calculus I", instructor="Prof. Chen"
    )
    db.add_all([course1, course2])
    db.commit()

    # Create enrollments
    enrollment1 = Enrollment(
        student_id=test_student.student_id, course_id=course1.course_id, progress=85
    )
    enrollment2 = Enrollment(
        student_id=test_student.student_id, course_id=course2.course_id, progress=70
    )
    db.add_all([enrollment1, enrollment2])
    db.commit()

    # Create grades
    grade1 = Grade(enrollment_id=enrollment1.enrollment_id, grade="A")
    grade2 = Grade(enrollment_id=enrollment2.enrollment_id, grade="B+")
    db.add_all([grade1, grade2])
    db.commit()

    # Create deadlines
    deadline1 = Deadline(
        student_id=test_student.student_id,
        title="Calculus I Assignment 4",
        due_date=datetime.utcnow() + timedelta(days=2),
        status="Pending",
    )
    deadline2 = Deadline(
        student_id=test_student.student_id,
        title="Intro to Programming Project 2",
        due_date=datetime.utcnow() + timedelta(days=5),
        status="In Progress",
    )
    db.add_all([deadline1, deadline2])
    db.commit()

    return {
        "courses": [course1, course2],
        "enrollments": [enrollment1, enrollment2],
        "grades": [grade1, grade2],
        "deadlines": [deadline1, deadline2],
    }
