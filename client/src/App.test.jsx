import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App.jsx";
import * as api from "./services/api.js";

vi.mock("./services/api.js", () => ({
  getKPIs: vi.fn(() =>
    Promise.resolve({
      sales_per_linear_ft: 425.5,
      private_brand_share: 28.4,
      in_stock_rate: 96.8,
      shelf_capacity_utilization: 88.2,
    }),
  ),
  getSKUs: vi.fn(() =>
    Promise.resolve({
      items: [
        {
          sku_id: "SKU-8821",
          product_name: "Clover Valley Potato Chips 10oz",
          brand_type: "Private",
          weekly_sales: 1240,
          margin_percent: 38.5,
          shelf_space: '12"',
          status: "GROW",
        },
      ],
      total: 1,
      page: 1,
      limit: 5,
    }),
  ),
  getScenario: vi.fn((name) =>
    Promise.resolve({
      scenario_name: name,
      projected_sales_change: 5,
      projected_private_brand_share: 3,
      projected_shelf_space_change: 4,
      sku_action_summary: { grow: 12, maintain: 24, reduce: 4, swap: 8 },
      guardrails: {
        margin_threshold: "PASSED",
        private_brand_goal: "PASSED",
        shelf_capacity_check: "PASSED",
      },
    }),
  ),
  submitApproval: vi.fn((name) =>
    Promise.resolve({
      success: true,
      message: "Assortment Plan Submitted Successfully!",
      transaction_id: "TXN-99821-498",
      submitted_at: "2026-01-01T12:00:00Z",
      user: "Marcus Vance",
    }),
  ),
}));

describe("DG Cluster Assortment Advisor App", () => {
  it("renders the dashboard with KPIs and SKU table", async () => {
    render(<App />);

    // Check header
    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();

    // Check KPIs
    await waitFor(() => {
      expect(screen.getByText("$425.50")).toBeInTheDocument();
      expect(screen.getByText("28.4%")).toBeInTheDocument();
    });

    // Check SKU Table
    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
  });

  it("allows selecting a scenario and submitting", async () => {
    render(<App />);

    // Click Conservative scenario
    const conservativeCard = await screen.findByText("Conservative");
    fireEvent.click(conservativeCard);

    // Submit plan
    const submitBtn = await screen.findByText("Submit Assortment Plan");
    fireEvent.click(submitBtn);

    // Check success banner
    await waitFor(() => {
      expect(
        screen.getByText("Assortment Plan Submitted Successfully!"),
      ).toBeInTheDocument();
      expect(screen.getByText(/TXN-99821-498/)).toBeInTheDocument();
    });
  });
});
