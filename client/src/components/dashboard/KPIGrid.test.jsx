import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KPIGrid from "./KPIGrid";

describe("KPIGrid Component", () => {
  it("renders KPI cards with correct values", () => {
    render(<KPIGrid total={24} confirmed={18} pending={4} unavailable={5} />);

    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();

    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    expect(screen.getByText("Unavailable Days")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
