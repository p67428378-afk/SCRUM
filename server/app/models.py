import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Student(Base):
    __tablename__ = "students"

    student_id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    preferred_name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    mfa_secret = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    enrollments = relationship(
        "Enrollment", back_populates="student", cascade="all, delete-orphan"
    )
    deadlines = relationship(
        "Deadline", back_populates="student", cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String(36), primary_key=True, default=generate_uuid)
    course_code = Column(String, unique=True, nullable=False, index=True)
    course_name = Column(String, nullable=False)
    instructor = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    enrollments = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(
        String(36),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        String(36), ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=False
    )
    progress = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    grade_rel = relationship(
        "Grade",
        back_populates="enrollment",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Grade(Base):
    __tablename__ = "grades"

    grade_id = Column(String(36), primary_key=True, default=generate_uuid)
    enrollment_id = Column(
        String(36),
        ForeignKey("enrollments.enrollment_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    grade = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    enrollment = relationship("Enrollment", back_populates="grade_rel")


class Deadline(Base):
    __tablename__ = "deadlines"

    deadline_id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(
        String(36),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
    )
    title = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String, default="Pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    student = relationship("Student", back_populates="deadlines")
