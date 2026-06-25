import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";
import * as api from "./services/api.js";

// Mock the API service
vi.mock("./services/api.js", () => ({
  getDashboardData: vi.fn(),
  submitAssortment: vi.fn(),
}));

const mockDashboardData = {
  kpis: {
    sales_per_linear_ft: 250.0,
    private_brand_pct: 18.0,
    in_stock_rate: 95.5,
    shelf_capacity: 85.0,
  },
  skus: [
    {
      sku: "SKU-1001",
      name: "Lay's Classic 8oz",
      sales: 12500.0,
      units: 3500,
      margin: 0.35,
      days_of_supply: 12,
      private_brand: false,
      status: "GROW",
    },
    {
      sku: "SKU-1002",
      name: "Clover Valley Potato Chips 8oz",
      sales: 8500.0,
      units: 2800,
      margin: 0.45,
      days_of_supply: 15,
      private_brand: true,
      status: "MAINTAIN",
    },
  ],
  scenarios: {
    conservative: {
      name: "Conservative",
      projected_sales_impact: 1.02,
      projected_private_brand_pct: 21.0,
      projected_shelf_capacity: 82.0,
      guardrails: {
        private_brand_check: "PASS",
        shelf_capacity_check: "PASS",
      },
      sku_actions: [
        { sku: "SKU-1001", action: "MAINTAIN" },
        { sku: "SKU-1002", action: "GROW" },
      ],
    },
    balanced: {
      name: "Balanced",
      projected_sales_impact: 1.05,
      projected_private_brand_pct: 22.5,
      projected_shelf_capacity: 84.0,
      guardrails: {
        private_brand_check: "PASS",
        shelf_capacity_check: "PASS",
      },
      sku_actions: [
        { sku: "SKU-1001", action: "GROW" },
        { sku: "SKU-1002", action: "MAINTAIN" },
      ],
    },
    aggressive: {
      name: "Aggressive",
      projected_sales_impact: 1.12,
      projected_private_brand_pct: 19.0,
      projected_shelf_capacity: 89.0,
      guardrails: {
        private_brand_check: "FAIL",
        shelf_capacity_check: "PASS",
      },
      sku_actions: [
        { sku: "SKU-1001", action: "GROW" },
        { sku: "SKU-1002", action: "SWAP" },
      ],
    },
  },
};

describe("DG Cluster Assortment Advisor App", () => {
  it("renders loading state initially and then displays dashboard data", async () => {
    vi.mocked(api.getDashboardData).mockResolvedValue(mockDashboardData);

    render(<App />);

    // Verify loading state or elements
    expect(
      screen.getByText(/DG Cluster Assortment Advisor/i),
    ).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Lay's Classic 8oz/i)).toBeInTheDocument();
    });

    // Verify KPIs are rendered
    expect(screen.getByText(/\$250\.00/)).toBeInTheDocument();
    expect(screen.getAllByText(/18\.0%/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/95\.5%/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/85\.0%/)[0]).toBeInTheDocument();

    // Verify Scenario Selector is rendered
    expect(screen.getAllByText(/Conservative/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Balanced/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Aggressive/i)[0]).toBeInTheDocument();
  });

  it("allows selecting a different scenario and submitting", async () => {
    vi.mocked(api.getDashboardData).mockResolvedValue(mockDashboardData);
    vi.mocked(api.submitAssortment).mockResolvedValue({
      id: "test-submission-id",
      scenario_name: "Balanced",
      submitted_by: "Category Manager",
      submission_timestamp: "2026-01-01T12:00:00Z",
      sku_actions: [
        { sku: "SKU-1001", action: "GROW" },
        { sku: "SKU-1002", action: "MAINTAIN" },
      ],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Lay's Classic 8oz/i)).toBeInTheDocument();
    });

    // Click on Conservative scenario
    const conservativeBtn = screen.getAllByText(/Conservative/i)[0];
    fireEvent.click(conservativeBtn);

    // Verify review panel updates
    expect(
      screen.getByText(/Conservative Scenario Selected/i),
    ).toBeInTheDocument();

    // Click on Balanced scenario again
    const balancedBtn = screen.getAllByText(/Balanced/i)[0];
    fireEvent.click(balancedBtn);

    // Click submit button
    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Changes/i,
    });
    fireEvent.click(submitBtn);

    // Wait for success banner
    await waitFor(() => {
      expect(
        screen.getByText(/Assortment Changes Submitted Successfully!/i),
      ).toBeInTheDocument();
    });

    // Verify audit trail
    expect(screen.getByText(/test-submission-id/i)).toBeInTheDocument();
  });
});
