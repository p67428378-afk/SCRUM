import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CalendarGrid from "./CalendarGrid";

describe("CalendarGrid Component", () => {
  it("renders calendar grid correctly", () => {
    render(<CalendarGrid availability={[]} selectedDates={[]} />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
  });
});
