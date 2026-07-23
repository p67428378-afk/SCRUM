import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import KPIHeaderStrip from "./KPIHeaderStrip";

describe("KPIHeaderStrip Component", () => {
  it("renders loading state", () => {
    render(<KPIHeaderStrip loading={true} />);
    // Should render skeleton loaders
    const skeletons = screen.queryAllByRole("heading");
    expect(skeletons.length).toBe(0);
  });

  it("renders error state", () => {
    render(<KPIHeaderStrip error="Failed to load" />);
    expect(screen.getByText(/Failed to load KPI metrics/i)).toBeInTheDocument();
  });

  it("renders KPI cards with correct values", () => {
    const mockKPIs = {
      sales_per_linear_ft: 125.5,
      private_brand_percentage: 15.2,
      in_stock_rate: 98.5,
      shelf_capacity: 85.0,
    };

    render(<KPIHeaderStrip kpis={mockKPIs} loading={false} error={null} />);

    // Check for KPI titles
    expect(screen.getByText("Sales per Linear Ft")).toBeInTheDocument();
    expect(screen.getByText("Private Brand %")).toBeInTheDocument();
    expect(screen.getByText("In-Stock Rate")).toBeInTheDocument();
    expect(screen.getByText("Shelf Capacity")).toBeInTheDocument();

    // Check for KPI values
    expect(screen.getByText("$125.50")).toBeInTheDocument();
    expect(screen.getByText("15.2%")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();
    expect(screen.getByText("85.0%")).toBeInTheDocument();
  });
});
