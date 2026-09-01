import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import PatientDirectoryTable from "./PatientDirectoryTable";

const mockPatients = [
  {
    id: "uuid-123",
    full_name: "Jane Doe",
    dob: "1990-05-15",
    gender: "Female",
    phone: "+1-555-0199",
    email: "jane@example.com",
    insurance_provider: "HealthShield",
    insurance_policy_number: "HS-9988",
  },
];

describe("PatientDirectoryTable", () => {
  it("renders patient rows correctly", () => {
    render(
      <BrowserRouter>
        <PatientDirectoryTable patients={mockPatients} loading={false} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("+1-555-0199")).toBeInTheDocument();
    expect(screen.getByText("HealthShield")).toBeInTheDocument();
  });

  it("calls onOpenIntakeModal when New Patient Intake button is clicked", () => {
    const handleOpen = vi.fn();
    render(
      <BrowserRouter>
        <PatientDirectoryTable
          patients={[]}
          loading={false}
          onOpenIntakeModal={handleOpen}
        />
      </BrowserRouter>,
    );

    const button = screen.getByRole("button", { name: /New Patient Intake/i });
    fireEvent.click(button);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
