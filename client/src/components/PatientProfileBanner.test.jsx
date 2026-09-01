import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PatientProfileBanner from "./PatientProfileBanner";

const samplePatient = {
  id: "p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f",
  full_name: "Jane Doe",
  dob: "1990-05-15",
  gender: "female",
  phone: "+1-555-0199",
  email: "jane@example.com",
  emergency_contact: "John Doe (+1-555-0100)",
  insurance_provider: "HealthShield",
  insurance_policy_number: "HS-998822",
};

describe("PatientProfileBanner", () => {
  it("displays patient demographics and SSN badge", () => {
    render(<PatientProfileBanner patient={samplePatient} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("SSN Verified & Hashed")).toBeInTheDocument();
    expect(screen.getByText("Insurance: HealthShield")).toBeInTheDocument();
  });
});
