import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardPage from "./DashboardPage";
import { academicsService } from "../services/api";

// Mock the academicsService
vi.mock("../services/api", () => ({
  academicsService: {
    getAcademicProgress: vi.fn(),
  },
}));

describe("DashboardPage Component", () => {
  it("renders loading state initially and then data", async () => {
    const mockProgress = {
      gpa: 3.85,
      completed_credits: 92,
      enrolled_courses: [
        {
          course_code: "CS-301",
          course_name: "Intro to Programming",
          instructor: "Dr. Jenkins",
          grade: "A",
          progress: 85,
        },
      ],
      upcoming_deadlines: [
        {
          id: "1",
          title: "Calculus I Assignment",
          due_date: "2026-06-12T23:59:59Z",
          status: "Pending",
        },
      ],
    };

    academicsService.getAcademicProgress.mockResolvedValue(mockProgress);

    render(<DashboardPage />);

    // Wait for loading to disappear and data to render
    await waitFor(() => {
      expect(screen.getByText("3.85")).toBeInTheDocument();
    });

    expect(screen.getByText("Intro to Programming")).toBeInTheDocument();
    expect(screen.getByText("Calculus I Assignment")).toBeInTheDocument();
  });
});
