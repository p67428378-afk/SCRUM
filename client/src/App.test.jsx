import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";

// Mock the API services
vi.mock("./services/api", () => {
  return {
    getKPIs: vi.fn(() =>
      Promise.resolve({
        sales_per_linear_ft: 15.75,
        private_brand_pct: 22.4,
        in_stock_rate: 98.2,
        shelf_capacity: 88,
      }),
    ),
    getSKUs: vi.fn(() =>
      Promise.resolve([
        {
          sku_id: "SKU-1045",
          product_name: "Clover Valley Potato Chips",
          sales_ytd: 45230,
          units_sold: 18450,
          profit_margin: 42,
          status: "GROW",
        },
        {
          sku_id: "SKU-2099",
          product_name: "Lay's Classic 10oz",
          sales_ytd: 89100,
          units_sold: 22100,
          profit_margin: 28,
          status: "MAINTAIN",
        },
      ]),
    ),
    getScenario: vi.fn((name) =>
      Promise.resolve({
        scenario_name: name.charAt(0).toUpperCase() + name.slice(1),
        projected_sales_impact: 3.5,
        projected_pb_pct: 24.5,
        sku_actions: [
          { sku_id: "SKU-1045", action: "GROW" },
          { sku_id: "SKU-2099", action: "MAINTAIN" },
        ],
        guardrails: [
          { name: "Private Brand % goal", status: "MET" },
          { name: "Shelf Capacity limit", status: "MET" },
          { name: "In-Stock Risk", status: "MET" },
        ],
      }),
    ),
    submitReview: vi.fn(() =>
      Promise.resolve({
        message:
          "Assortment for Small Town Value Cluster submitted successfully!",
        status: "SUCCESS",
        submitted_at: "2026-01-01T12:00:00Z",
        transaction_id: "TXN-98234-A",
      }),
    ),
  };
});

describe("DG Cluster Assortment Advisor App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard with KPIs and SKU table", async () => {
    render(<App />);

    // Verify loading state is shown initially
    expect(
      screen.getByText(/Loading Assortment Advisor Dashboard/i),
    ).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading Assortment Advisor Dashboard/i),
      ).not.toBeInTheDocument();
    });

    // Verify TopNavBar elements
    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();
    expect(screen.getByText("Small Town Value Cluster")).toBeInTheDocument();

    // Verify KPI Header Strip elements
    expect(screen.getByText("Sales per Linear Ft")).toBeInTheDocument();
    expect(screen.getByText("$15.75")).toBeInTheDocument();
    expect(screen.getByText("Private Brand %")).toBeInTheDocument();
    expect(screen.getByText("22.4%")).toBeInTheDocument();

    // Verify SKU Performance table
    expect(screen.getByText("SKU Performance")).toBeInTheDocument();
    expect(screen.getByText("SKU-1045")).toBeInTheDocument();
    expect(screen.getByText("Clover Valley Potato Chips")).toBeInTheDocument();

    // Verify Scenario Selector
    expect(screen.getByText("Scenario Selector")).toBeInTheDocument();
    expect(screen.getByText("Conservative")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("Aggressive")).toBeInTheDocument();

    // Verify Approval Review Panel
    expect(
      screen.getByText("Approval Review: Balanced Scenario"),
    ).toBeInTheDocument();
    expect(screen.getByText("Submit Assortment Decisions")).toBeInTheDocument();
  });

  it("allows selecting a different scenario and submitting", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading Assortment Advisor Dashboard/i),
      ).not.toBeInTheDocument();
    });

    // Click on Conservative scenario
    const conservativeCard = screen.getByText("Conservative");
    fireEvent.click(conservativeCard);

    // Wait for scenario details to update
    await waitFor(() => {
      expect(
        screen.getByText("Approval Review: Conservative Scenario"),
      ).toBeInTheDocument();
    });

    // Click submit button
    const submitButton = screen.getByRole("button", {
      name: /Submit Assortment Decisions/i,
    });
    fireEvent.click(submitButton);

    // Wait for success banner
    await waitFor(() => {
      expect(
        screen.getByText(
          /Assortment for Small Town Value Cluster submitted successfully!/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/TXN-98234-A/i)).toBeInTheDocument();
    });
  });
});
