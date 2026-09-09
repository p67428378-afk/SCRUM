import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "./Dashboard";

vi.mock("../services/api", () => ({
  fetchZones: vi
    .fn()
    .mockResolvedValue([
      {
        id: "1",
        zone_code: "ZONE-01",
        name: "Downtown Central",
        status: "ACTIVE",
      },
    ]),
  fetchServiceRequests: vi
    .fn()
    .mockResolvedValue([
      {
        id: "101",
        ticket_number: "SR-2026-88392",
        title: "Water Leak",
        category: "WATER",
        priority: "HIGH",
        status: "SUBMITTED",
      },
    ]),
  fetchCitizens: vi
    .fn()
    .mockResolvedValue([
      { id: "201", full_name: "Jane Doe", email: "jane.doe@city.gov" },
    ]),
}));

describe("Dashboard Component", () => {
  it("renders dashboard heading and stat cards", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Administrative Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Total City Zones/i)).toBeInTheDocument();
    expect(screen.getByText(/Telemetry Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Service Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Registered Citizens/i)).toBeInTheDocument();
  });
});
