import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AvailabilityControlPanel from "./AvailabilityControlPanel";

describe("AvailabilityControlPanel Component", () => {
  it("renders prompt when no dates are selected", () => {
    render(<AvailabilityControlPanel selectedDates={[]} />);

    expect(screen.getByText("Manage Availability")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select one or more dates on the calendar to update your availability.",
      ),
    ).toBeInTheDocument();
  });

  it("renders form when dates are selected", () => {
    render(<AvailabilityControlPanel selectedDates={["2026-12-12"]} />);

    expect(screen.getByText("Selected Dates (1)")).toBeInTheDocument();
    expect(screen.getByText("2026-12-12")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });
});
