import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ZoneMetrics from "./ZoneMetrics";

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
  fetchZoneUtilityMetrics: vi.fn().mockResolvedValue([
    { id: "m1", metric_type: "WATER", value: 14200.5, unit: "Gal/Hr" },
    { id: "m2", metric_type: "POWER", value: 98.4, unit: "% Operational" },
  ]),
}));

describe("ZoneMetrics Component", () => {
  it("renders zone metrics telemetry explorer", async () => {
    render(<ZoneMetrics />);

    expect(screen.getByText(/Water Consumption/i)).toBeInTheDocument();
    expect(screen.getByText(/Power Grid Stability/i)).toBeInTheDocument();
    expect(screen.getByText(/Waste Accumulation/i)).toBeInTheDocument();
  });
});
