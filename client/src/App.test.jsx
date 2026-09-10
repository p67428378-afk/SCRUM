import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import App from "./App.jsx";
import * as api from "./services/api.js";

// Mock API service methods
vi.mock("./services/api.js", () => ({
  fetchKPIMetrics: vi.fn(),
  fetchSKUs: vi.fn(),
  fetchScenarios: vi.fn(),
  evaluateScenario: vi.fn(),
  checkGuardrails: vi.fn(),
  submitAssortmentPlan: vi.fn(),
  fetchSubmissions: vi.fn(),
  fetchSubmissionByCode: vi.fn(),
}));

describe("DG Cluster Assortment Advisor Dashboard Application", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.fetchKPIMetrics.mockResolvedValue({
      cluster_name: "Small Town Value Cluster",
      category: "Snacks",
      sales_per_linear_ft: 1250.0,
      private_brand_percentage: 28.0,
      in_stock_rate: 96.5,
      shelf_capacity_utilization: 85.0,
    });

    api.fetchSKUs.mockResolvedValue([
      {
        id: "1",
        sku_code: "SKU-10492",
        product_name: "Clover Valley Classic Potato Chips 8oz",
        category: "Snacks",
        cluster_id: "Small Town Value Cluster",
        is_private_brand: true,
        weekly_units_sold: 412,
        sales_per_linear_ft: 1340.0,
        margin_percentage: 44.2,
        linear_ft_allocated: 3.5,
        status_badge: "GROW",
      },
      {
        id: "2",
        sku_code: "SKU-22819",
        product_name: "Cheez-It Original Baked Crackers 7oz",
        category: "Snacks",
        cluster_id: "Small Town Value Cluster",
        is_private_brand: false,
        weekly_units_sold: 520,
        sales_per_linear_ft: 1420.0,
        margin_percentage: 29.8,
        linear_ft_allocated: 4.2,
        status_badge: "MAINTAIN",
      },
    ]);

    api.evaluateScenario.mockImplementation(async ({ scenario_type }) => {
      if (scenario_type === "Conservative") {
        return {
          scenario_type: "Conservative",
          projected_sales_lift_pct: 1.8,
          projected_pb_share_pct: 26.5,
          projected_capacity_pct: 81.0,
          recommended_actions: { GROW: 6, MAINTAIN: 16, SWAP: 4, REDUCE: 2 },
        };
      } else if (scenario_type === "Aggressive") {
        return {
          scenario_type: "Aggressive",
          projected_sales_lift_pct: 7.2,
          projected_pb_share_pct: 32.5,
          projected_capacity_pct: 92.0,
          recommended_actions: { GROW: 14, MAINTAIN: 8, SWAP: 5, REDUCE: 2 },
        };
      }
      return {
        scenario_type: "Balanced",
        projected_sales_lift_pct: 4.6,
        projected_pb_share_pct: 28.0,
        projected_capacity_pct: 85.0,
        recommended_actions: { GROW: 12, MAINTAIN: 10, SWAP: 4, REDUCE: 2 },
      };
    });

    api.checkGuardrails.mockResolvedValue({
      overall_status: "PASSED",
      checks: [
        {
          rule: "Min PB Share ≥ 25%",
          status: "PASSED",
          actual_value: "28.00%",
        },
        {
          rule: "Shelf Capacity Utilization ≤ 100%",
          status: "PASSED",
          actual_value: "85.00%",
        },
        {
          rule: "In-Stock Rate ≥ 95%",
          status: "PASSED",
          actual_value: "96.50%",
        },
      ],
    });

    api.submitAssortmentPlan.mockResolvedValue({
      audit_code: "AUD-2026-0518-01",
      message: "Assortment changes submitted successfully.",
      user_id: "category_mgr_01",
      scenario_type: "Balanced",
      total_sku_actions: 28,
      submitted_at: "2026-05-18T14:32:00Z",
    });
  });

  it("renders the main dashboard with header, KPI strip, and SKU table", async () => {
    render(<App />);

    expect(
      screen.getByText(/DG Cluster Assortment Advisor/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Small Town Value Cluster/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("kpi-sales-value")).toHaveTextContent(
        "$1,250.00",
      );
      expect(screen.getByTestId("kpi-pb-share-value")).toHaveTextContent(
        "28.0%",
      );
      expect(screen.getByTestId("kpi-in-stock-value")).toHaveTextContent(
        "96.5%",
      );
      expect(screen.getByTestId("kpi-capacity-value")).toHaveTextContent(
        "85.0%",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("SKU-10492")).toBeInTheDocument();
      expect(
        screen.getByText("Cheez-It Original Baked Crackers 7oz"),
      ).toBeInTheDocument();
    });
  });

  it("allows filtering SKUs by search and brand filter", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("SKU-10492")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("Search SKU or Product");
    fireEvent.change(searchInput, { target: { value: "Cheez-It" } });

    expect(screen.queryByText("SKU-10492")).not.toBeInTheDocument();
    expect(screen.getByText("SKU-22819")).toBeInTheDocument();
  });

  it("allows switching scenarios and updates projected metrics dynamically", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByTestId("scenario-card-aggressive"),
      ).toBeInTheDocument();
    });

    const aggressiveCard = screen.getByTestId("scenario-card-aggressive");
    fireEvent.click(aggressiveCard);

    await waitFor(() => {
      expect(api.evaluateScenario).toHaveBeenCalledWith(
        expect.objectContaining({ scenario_type: "Aggressive" }),
      );
    });
  });

  it("submits assortment plan and displays inline confirmation modal with audit details", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByTestId("submit-assortment-button"),
      ).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId("submit-assortment-button");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.submitAssortmentPlan).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("inline-confirmation-modal"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("audit-code-value")).toHaveTextContent(
        "AUD-2026-0518-01",
      );
    });

    // Close modal
    const closeBtn = screen.getByTestId("close-modal-button");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(
        screen.queryByTestId("inline-confirmation-modal"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("inline-success-banner")).toBeInTheDocument();
    });
  });
});
