import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EnrolledCoursesTable from "./EnrolledCoursesTable";

describe("EnrolledCoursesTable Component", () => {
  const mockCourses = [
    {
      course_code: "CS-301",
      course_name: "Intro to Programming",
      instructor: "Dr. Jenkins",
      grade: "A",
      progress: 85,
    },
  ];

  it("renders course details correctly", () => {
    render(<EnrolledCoursesTable courses={mockCourses} />);

    expect(screen.getByText("Intro to Programming")).toBeInTheDocument();
    expect(screen.getByText("CS-301")).toBeInTheDocument();
    expect(screen.getByText("Dr. Jenkins")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders empty state message when no courses", () => {
    render(<EnrolledCoursesTable courses={[]} />);
    expect(screen.getByText("No enrolled courses found.")).toBeInTheDocument();
  });
});
