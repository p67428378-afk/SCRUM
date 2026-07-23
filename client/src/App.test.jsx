import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import App from "./App";

// Mock the API calls
vi.mock("./services/api", () => ({
  getKPIs: vi.fn(() =>
    Promise.resolve({
      sales_per_linear_ft: 125.5,
      private_brand_percentage: 15.2,
      in_stock_rate: 98.5,
      shelf_capacity: 85.0,
    }),
  ),
  getSKUs: vi.fn(() =>
    Promise.resolve([
      {
        id: "1",
        product_name: "Spicy Nacho Chips",
        sku_id: "SNC-001",
        weekly_sales: 4250,
        profit_margin: 0.42,
        status: "GROW",
      },
    ]),
  ),
  getScenarios: vi.fn(() =>
    Promise.resolve([
      {
        name: "Balanced",
        projected_sales_lift: 0.038,
        private_brand_impact: 0.021,
        actions: [
          {
            action: "GROW",
            sku_id: "SNC-001",
            product_name: "Spicy Nacho Chips",
          },
        ],
        guardrails: [{ name: "Supply Chain Capacity", status: "PASSED" }],
      },
    ]),
  ),
  submitAssortment: vi.fn(() =>
    Promise.resolve({
      submission_id: "uuid-audit-789",
      status: "SUBMITTED",
      timestamp: "2026-01-01T12:00:00Z",
    }),
  ),
}));

describe("App Component", () => {
  it("renders the dashboard title and layout", async () => {
    render(<App />);

    // Check for sidebar title
    expect(screen.getByText("Advisor Suite")).toBeInTheDocument();

    // Check for main header title
    expect(screen.getByText("Small Town Value Cluster")).toBeInTheDocument();
  });
});
