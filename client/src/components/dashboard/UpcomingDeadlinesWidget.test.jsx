import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UpcomingDeadlinesWidget from "./UpcomingDeadlinesWidget";

describe("UpcomingDeadlinesWidget Component", () => {
  const mockDeadlines = [
    {
      id: "1",
      title: "Calculus I Assignment",
      course_name: "Calculus I",
      due_date: "2026-06-12T23:59:59Z",
      status: "Pending",
    },
  ];

  it("renders deadlines correctly", () => {
    render(<UpcomingDeadlinesWidget deadlines={mockDeadlines} />);

    expect(screen.getByText("Calculus I Assignment")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders empty state message when no deadlines", () => {
    render(<UpcomingDeadlinesWidget deadlines={[]} />);
    expect(screen.getByText("No upcoming deadlines.")).toBeInTheDocument();
  });
});
