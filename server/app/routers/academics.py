from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models import Student, Enrollment, Deadline
from server.app.schemas import (
    AcademicProgressResponse,
    EnrolledCourse,
    UpcomingDeadline,
)
from server.app.auth import get_current_student

router = APIRouter(prefix="/api/v1/academics", tags=["academics"])

GRADE_POINTS = {
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "F": 0.0,
}


@router.get("/progress", response_model=AcademicProgressResponse)
def get_academic_progress(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Fetch enrollments
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == current_student.student_id)
        .all()
    )

    enrolled_courses = []
    total_points = 0.0
    graded_courses_count = 0
    completed_credits = 0

    for enrollment in enrollments:
        course = enrollment.course
        grade_obj = enrollment.grade_rel
        grade_val = grade_obj.grade if grade_obj else None

        enrolled_courses.append(
            EnrolledCourse(
                course_code=str(course.course_code),
                course_name=str(course.course_name),
                instructor=str(course.instructor),
                grade=str(grade_val) if grade_val else None,
                progress=int(enrollment.progress),
            )
        )

        if grade_val:
            # Calculate GPA
            points = GRADE_POINTS.get(str(grade_val).upper())
            if points is not None:
                total_points += points
                graded_courses_count += 1

                # Completed credits: 3 credits per passed course (grade not F)
                if str(grade_val).upper() != "F":
                    completed_credits += 3

    gpa = (
        round(total_points / graded_courses_count, 2)
        if graded_courses_count > 0
        else 0.0
    )

    # Fetch upcoming deadlines
    deadlines = (
        db.query(Deadline)
        .filter(Deadline.student_id == current_student.student_id)
        .all()
    )
    upcoming_deadlines = [
        UpcomingDeadline(
            id=str(deadline.deadline_id),
            title=str(deadline.title),
            due_date=deadline.due_date,  # type: ignore
            status=str(deadline.status),
        )
        for deadline in deadlines
    ]

    return AcademicProgressResponse(
        gpa=gpa,
        completed_credits=completed_credits,
        enrolled_courses=enrolled_courses,
        upcoming_deadlines=upcoming_deadlines,
    )
