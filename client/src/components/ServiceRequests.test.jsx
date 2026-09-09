import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ServiceRequests from "./ServiceRequests";

vi.mock("../services/api", () => ({
  fetchServiceRequests: vi.fn().mockResolvedValue([
    {
      id: "101",
      ticket_number: "SR-2026-88392",
      title: "Main Street Water Leak",
      category: "WATER",
      priority: "HIGH",
      status: "SUBMITTED",
    },
  ]),
  fetchZones: vi
    .fn()
    .mockResolvedValue([{ id: "z1", zone_code: "ZONE-01", name: "Downtown" }]),
  fetchCitizens: vi
    .fn()
    .mockResolvedValue([{ id: "c1", full_name: "Jane Doe" }]),
  createServiceRequest: vi.fn(),
  updateServiceRequestStatus: vi.fn(),
}));

describe("ServiceRequests Component", () => {
  it("renders service request queue and submit button", async () => {
    render(<ServiceRequests />);

    expect(
      screen.getByText(/Service Request Portal & Dispatch Queue/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Submit New Service Request/i)).toBeInTheDocument();
  });
});
