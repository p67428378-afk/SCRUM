import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StaffTable from "./StaffTable";

describe("StaffTable Component", () => {
  const mockStaff = [
    {
      id: "stf-1",
      full_name: "Sarah Jenkins",
      email: "sarah@salon.com",
      phone: "555-0111",
      working_hours: "09:00 - 17:00",
      is_active: true,
    },
  ];

  it("renders staff directory header and search input", () => {
    render(<StaffTable staffList={mockStaff} services={[]} />);
    expect(screen.getByText(/Staff Directory & Profiles/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search staff members/i),
    ).toBeInTheDocument();
  });

  it("renders provided staff member in table", () => {
    render(<StaffTable staffList={mockStaff} services={[]} />);
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("sarah@salon.com")).toBeInTheDocument();
  });
});
