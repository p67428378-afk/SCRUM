import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StaffTimeline from "./StaffTimeline";

describe("StaffTimeline Component", () => {
  it("renders timeline title and hour slots", () => {
    render(<StaffTimeline staffList={[]} appointments={[]} />);
    expect(
      screen.getByText(/Daily Staff Schedule & Shift Timeline/i),
    ).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("17:00")).toBeInTheDocument();
  });
});
