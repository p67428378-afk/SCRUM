import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TableFloorPlan from "./TableFloorPlan";

describe("TableFloorPlan Component", () => {
  const mockTables = [
    { id: "t1", table_number: 1, capacity: 2, status: "Available" },
    { id: "t2", table_number: 2, capacity: 4, status: "Occupied" },
  ];

  it("renders floor plan tables and status badges", () => {
    render(<TableFloorPlan tables={mockTables} />);
    expect(screen.getByText("Interactive Floor Plan")).toBeInTheDocument();
    expect(screen.getByText("Table 1")).toBeInTheDocument();
    expect(screen.getByText("Table 2")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Occupied")).toBeInTheDocument();
  });
});
