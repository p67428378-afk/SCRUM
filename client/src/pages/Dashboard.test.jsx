import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./Dashboard.jsx";
import * as api from "../services/api.js";

// Mock the API module
vi.mock("../services/api.js", () => ({
  getKPIs: vi.fn(),
  getSKUs: vi.fn(),
  getScenario: vi.fn(),
  submitAssortment: vi.fn(),
}));

describe("Dashboard Component Smoke and Integration Tests", () => {
  const mockKPIs = {
    sales_per_linear_ft: 15.75,
    private_brand_pct: 22.0,
    in_stock_rate: 94.2,
    shelf_capacity: 85.0,
  };

  const mockSKUs = {
    items: [
      {
        sku_id: "1004592",
        name: "DG CHIPS-SALTED 8OZ",
        weekly_sales: 425.5,
        profit_margin: 38.0,
        private_brand: true,
        status: "GROW",
      },
    ],
    page: 1,
    per_page: 5,
    total: 1,
  };

  const mockScenarioBalanced = {
    scenario_name: "Balanced",
    projected_sales_change_pct: 3.5,
    projected_private_brand_pct: 22.0,
    projected_shelf_capacity: 85.0,
    actions_summary: { adds: 3, swaps: 8, removals: 4 },
    guardrails: [
      { name: "Private Brand Minimum (20%)", status: "PASS", value: "22%" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getKPIs.mockResolvedValue(mockKPIs);
    api.getSKUs.mockResolvedValue(mockSKUs);
    api.getScenario.mockImplementation((name) => {
      return Promise.resolve({
        ...mockScenarioBalanced,
        scenario_name: name,
      });
    });
  });

  it("renders the dashboard with KPI cards and SKU table", async () => {
    render(<Dashboard />);

    // Verify title is present
    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();

    // Wait for KPIs to load and verify
    await waitFor(() => {
      expect(screen.getByText("$15.75")).toBeInTheDocument();
    });

    // Verify SKU table content
    expect(screen.getByText("DG CHIPS-SALTED 8OZ")).toBeInTheDocument();
  });

  it("allows selecting a different scenario and submitting", async () => {
    api.submitAssortment.mockResolvedValue({
      status: "SUCCESS",
      summary: "3 Adds, 8 Swaps, 4 Removals",
      timestamp: "2026-01-09T11:50:00Z",
      transaction_id: "TXN-496-8821A",
    });

    render(<Dashboard />);

    // Wait for scenario data to load
    await waitFor(() => {
      expect(
        screen.getByText("Approval Review (Balanced)"),
      ).toBeInTheDocument();
    });

    // Click submit button
    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    fireEvent.click(submitBtn);

    // Verify success banner appears
    await waitFor(() => {
      expect(
        screen.getByText("Assortment Plan Successfully Submitted!"),
      ).toBeInTheDocument();
      expect(screen.getByText(/TXN-496-8821A/)).toBeInTheDocument();
    });
  });
});
