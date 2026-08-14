import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import StatsOverview from "./StatsOverview";

describe("StatsOverview Component", () => {
  it("renders metric cards with provided statistics", () => {
    const stats = {
      total: 10,
      completed: 5,
      in_progress: 3,
      overdue: 2,
      completion_rate: 50.0,
    };

    render(<StatsOverview stats={stats} loading={false} />);

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("5 (50%)")).toBeInTheDocument();
  });
});
