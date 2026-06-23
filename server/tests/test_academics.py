from server.app.auth import create_access_token


def test_get_academic_progress_success(client, test_student, test_academic_data):
    token = create_access_token(data={"sub": test_student.email})
    response = client.get(
        "/api/v1/academics/progress", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # GPA calculation: A (4.0) and B+ (3.3) -> average = 3.65
    assert data["gpa"] == 3.65

    # Completed credits: 2 courses * 3 credits = 6 credits
    assert data["completed_credits"] == 6

    # Enrolled courses
    assert len(data["enrolled_courses"]) == 2
    courses = {c["course_code"]: c for c in data["enrolled_courses"]}
    assert "CS-301" in courses
    assert courses["CS-301"]["grade"] == "A"
    assert courses["CS-301"]["progress"] == 85
    assert "MATH-201" in courses
    assert courses["MATH-201"]["grade"] == "B+"
    assert courses["MATH-201"]["progress"] == 70

    # Upcoming deadlines
    assert len(data["upcoming_deadlines"]) == 2
    deadlines = {d["title"]: d for d in data["upcoming_deadlines"]}
    assert "Calculus I Assignment 4" in deadlines
    assert deadlines["Calculus I Assignment 4"]["status"] == "Pending"
    assert "Intro to Programming Project 2" in deadlines
    assert deadlines["Intro to Programming Project 2"]["status"] == "In Progress"


def test_get_academic_progress_unauthorized(client):
    response = client.get("/api/v1/academics/progress")
    assert response.status_code == 401
