import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import CmaAnalyticsDashboard from "./CmaAnalyticsDashboard";

// Mock analytics API
vi.mock("../services/api", () => ({
  analyticsApi: {
    getCmaAnalytics: vi.fn().mockResolvedValue({
      location: "Austin",
      insufficient_data: false,
      median_price_per_sqft: 420.5,
      average_days_on_market: 24.0,
      price_trend_points: [{ month: "2025-01", avg_price_per_sqft: 400.0 }],
    }),
  },
  propertiesApi: {
    getProperties: vi.fn().mockResolvedValue([]),
  },
}));

describe("CmaAnalyticsDashboard Component", () => {
  it("renders search inputs and header", async () => {
    render(<CmaAnalyticsDashboard city="Austin" zipCode="78701" />);
    expect(
      screen.getByText(/Comparative Market Analysis \(CMA\) Aggregator/i),
    ).toBeInTheDocument();
  });
});
