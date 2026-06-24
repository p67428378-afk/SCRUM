import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";

// Mock the API services
vi.mock("./services/api.js", () => {
  return {
    getDashboardData: vi.fn(() =>
      Promise.resolve({
        kpi_metrics: {
          in_stock_rate: 96.2,
          private_brand_pct: 28.4,
          sales_per_linear_ft: 124.5,
          shelf_capacity: 85,
        },
        scenarios: [
          {
            name: "Balanced",
            description: "Optimized mix of national and private brands.",
            guardrails: {
              in_stock_rate_above_minimum: true,
              private_brand_target_met: true,
              shelf_capacity_within_limits: true,
            },
            projected_impact: {
              in_stock_rate: 96.5,
              private_brand_pct: 29.5,
              sales_per_linear_ft: 128.4,
              shelf_capacity: 84.5,
            },
            sku_actions: [{ action: "GROW", sku: "SKU-1001" }],
          },
        ],
        sku_performance: [
          {
            brand: "Lay's",
            id: "uuid-1",
            in_stock_rate: 98.5,
            linear_ft: 2.5,
            name: "Lay's Classic Potato Chips 8oz",
            private_brand: false,
            recommended_action: "MAINTAIN",
            sales: 15200,
            sales_per_linear_ft: 6080,
            shelf_capacity_pct: 75,
            sku: "SKU-1001",
          },
        ],
      }),
    ),
    submitAssortmentPlan: vi.fn(() =>
      Promise.resolve({
        audit_trail_id: "audit-uuid-12345",
        status: "SUCCESS",
        submitted_at: "2026-06-24T14:31:27Z",
        submitted_by: "category_manager@dollargeneral.com",
      }),
    ),
  };
});

describe("DG Assortment Advisor App", () => {
  it("renders the dashboard with KPI metrics and SKU performance table", async () => {
    render(<App />);

    // Verify loading state is shown initially
    expect(screen.getByText(/Loading Assortment Advisor/i)).toBeInTheDocument();

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading Assortment Advisor/i),
      ).not.toBeInTheDocument();
    });

    // Verify header title
    expect(
      screen.getByText(/Small Town Value Cluster — Snacks Assortment/i),
    ).toBeInTheDocument();

    // Verify KPI Header Strip labels
    expect(screen.getByText(/Sales \/ Linear Ft/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Brand %/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Stock %/i)).toBeInTheDocument();
    expect(screen.getByText(/Shelf Capacity/i)).toBeInTheDocument();

    // Verify SKU Performance Table renders the SKU
    expect(screen.getByText("SKU-1001")).toBeInTheDocument();
    expect(
      screen.getByText("Lay's Classic Potato Chips 8oz"),
    ).toBeInTheDocument();

    // Verify Scenario Selector renders the Balanced scenario
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(
      screen.getByText(/Optimized mix of national and private brands/i),
    ).toBeInTheDocument();

    // Verify Approval Review Panel
    expect(
      screen.getByText(/Approval Review Panel — Balanced Scenario/i),
    ).toBeInTheDocument();
  });
});
