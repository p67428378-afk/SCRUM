import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import App from "./App";

// Mock api service calls so tests don't hit live backend
vi.mock("./services/api", () => ({
  searchPatients: vi.fn().mockResolvedValue({
    total: 2,
    skip: 0,
    limit: 20,
    items: [
      {
        id: "uuid-101",
        patient_code: "PAT-1001",
        full_name: "John Doe",
        date_of_birth: "1985-06-15",
        gender: "Male",
        contact_number: "555-0199",
        email: "john.doe@example.com",
        insurance_info: { provider: "BlueCross" },
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "uuid-102",
        patient_code: "PAT-1002",
        full_name: "Jane Smith",
        date_of_birth: "1990-04-20",
        gender: "Female",
        contact_number: "555-0188",
        email: "jane.smith@example.com",
        insurance_info: { provider: "Aetna" },
        created_at: "2026-01-02T00:00:00Z",
      },
    ],
  }),
  getPatient: vi.fn().mockResolvedValue({
    id: "uuid-101",
    patient_code: "PAT-1001",
    full_name: "John Doe",
    date_of_birth: "1985-06-15",
    gender: "Male",
    contact_number: "555-0199",
    email: "john.doe@example.com",
  }),
  getMedicalHistory: vi.fn().mockResolvedValue({
    id: "med-101",
    patient_id: "uuid-101",
    allergies: ["Penicillin - Severe"],
    chronic_conditions: ["Type 2 Diabetes"],
    current_medications: ["Metformin 500mg"],
    visit_notes: "Initial checkup completed.",
  }),
  login: vi.fn(),
  logout: vi.fn(),
}));

describe("Patients Management System App", () => {
  it("renders directory page title without crashing", async () => {
    render(<App />);
    const titleElement = await screen.findByText(
      /Patient Directory & Records/i,
    );
    expect(titleElement).toBeInTheDocument();
  });

  it("displays navigation portal header", async () => {
    render(<App />);
    const headerElement = await screen.findByText(/CarePulse/i);
    expect(headerElement).toBeInTheDocument();
  });
});
