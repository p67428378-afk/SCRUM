import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KPIGrid from "./KPIGrid";

describe("KPIGrid Component", () => {
  it("renders KPI values correctly", () => {
    render(
      <KPIGrid
        gpa={3.85}
        enrolledCount={4}
        completedCredits={92}
        pendingDeadlinesCount={2}
      />,
    );

    expect(screen.getByText("3.85")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
