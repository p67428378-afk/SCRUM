import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "./DashboardPage.jsx";
import * as api from "../services/api.js";

// Mock the API services
vi.mock("../services/api.js", () => ({
  getDashboardData: vi.fn(),
  applyScenario: vi.fn(),
  submitAssortment: vi.fn(),
}));

describe("DashboardPage Component", () => {
  const mockDashboardData = {
    kpis: {
      sales_per_linear_ft: { value: 145.5, change: 2.5 },
      private_brand_pct: { value: 28.5, change: 1.2 },
      in_stock_rate: { value: 96.4, change: -0.5 },
      shelf_capacity: { value: 82, change: 0 },
    },
    skus: [
      {
        id: "1",
        sku_id: "SKU-1001",
        name: "Lay's Classic 8oz",
        brand: "Lay's",
        weekly_sales: 1250,
        sales_trend_wow: 12,
        profit_margin: 35,
        days_of_supply: 5,
        is_private_brand: false,
        recommendation_status: "GROW",
      },
    ],
  };

  const mockScenarioData = {
    scenario_name: "Balanced",
    projected_sales_lift: 3.2,
    projected_private_brand_pct: 28.1,
    guardrails: {
      private_brand_valid: true,
      shelf_capacity_valid: true,
    },
    sku_actions: [
      {
        action: "SWAP",
        sku_id: "SKU-1002",
        name: "Clover Valley Pretzels 16oz",
        replacement_sku_id: "SKU-2001",
        replacement_name: "Clover Valley Honey Mustard Pretzels 16oz",
      },
    ],
  };

  const mockSubmitResponse = {
    confirmation_number: "CONF-STV-20260702-99",
    status: "SUCCESS",
    submission_id: "a5b07384-d113-49c3-a5e0-4dfd982e4799",
    summary:
      "Assortment changes submitted successfully! 1 SKU swap executed under Balanced Strategy.",
    timestamp: "2026-07-02T15:15:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getDashboardData.mockResolvedValue(mockDashboardData);
    api.applyScenario.mockResolvedValue(mockScenarioData);
    api.submitAssortment.mockResolvedValue(mockSubmitResponse);
  });

  it("renders the dashboard with KPIs and SKU table", async () => {
    render(<DashboardPage />);

    // Verify loading state initially or wait for data
    await waitFor(() => {
      expect(
        screen.getByText("DG Cluster Assortment Advisor"),
      ).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getByText("$145.50")).toBeInTheDocument();
    expect(screen.getByText("28.5%")).toBeInTheDocument();
    expect(screen.getByText("96.4%")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();

    // Check SKU Table
    expect(screen.getByText("Lay's Classic 8oz")).toBeInTheDocument();
  });

  it("allows selecting a different scenario strategy", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Conservative Strategy")).toBeInTheDocument();
    });

    const conservativeCard = screen.getByText("Conservative Strategy");
    fireEvent.click(conservativeCard);

    await waitFor(() => {
      expect(api.applyScenario).toHaveBeenCalledWith("Conservative");
    });
  });

  it("submits the assortment and displays confirmation banner", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Submit Assortment Decision"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit Assortment Decision");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.submitAssortment).toHaveBeenCalled();
      expect(
        screen.getByText("Assortment Submitted Successfully!"),
      ).toBeInTheDocument();
    });
  });
});
